import "dotenv/config";
import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { admin, organization } from "better-auth/plugins";
import { sharedAuthEvents } from "../providers/auth-events.provider";
import {
  ORG_CREATOR_ROLE,
  orgAccessControl,
  orgRoles,
} from "~/organization/role/config/access-control";
import { provisionDefaultRoles } from "~/organization/role/config/provision-default-roles";
import { AuthEmailArgs } from "../interfaces/auth-email-args.interface";
import { InvitationEmailArgs } from "../interfaces/invitation-email-args.interface";

const emitAuthEmail =
  (event: "reset-password" | "verify-email") =>
  ({ user, url, token }: AuthEmailArgs) => {
    sharedAuthEvents.emit(event, {
      email: user.email,
      name: user.name ?? user.email,
      url,
      token,
    });
    return Promise.resolve();
  };

const emitInvitationEmail = ({
  id,
  email,
  organization,
  inviter,
}: InvitationEmailArgs) => {
  const frontOrigin = process.env.FRONT_ORIGIN ?? "http://localhost:3000";
  sharedAuthEvents.emit("organization-invitation", {
    email,
    invitedByName: inviter.user.name ?? inviter.user.email,
    invitedByEmail: inviter.user.email,
    organizationName: organization.name,
    inviteLink: `${frontOrigin}/accept-invitation/${id}`,
  });
  return Promise.resolve();
};

export const auth = betterAuth({
  baseURL: `http://localhost:${process.env.PORT ?? 3000}`,
  trustedOrigins: [process.env.FRONT_ORIGIN ?? "http://localhost:3000"],
  basePath: "/api/auth",
  hooks: {},
  database: new Pool({
    host: process.env.DATABASE_HOST,
    port: Number.parseInt(process.env.DATABASE_PORT || "5432"),
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 40,
    revokeSessionsOnPasswordReset: true,
    requireEmailVerification: true,
    sendResetPassword: emitAuthEmail("reset-password"),
  },
  emailVerification: {
    enabled: true,
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: emitAuthEmail("verify-email"),
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
      defaultBanReason: "Violation des conditions d'utilisation",
      bannedUserMessage:
        "Votre compte a été suspendu. Contactez le support si vous pensez qu'il s'agit d'une erreur.",
      impersonationSessionDuration: 60 * 60,
      allowImpersonatingAdmins: false,
    }),
    organization({
      allowUserToCreateOrganization: false,
      creatorRole: ORG_CREATOR_ROLE,
      ac: orgAccessControl,
      roles: orgRoles,
      dynamicAccessControl: {
        enabled: true,
        maximumRolesPerOrganization: 25,
      },
      organizationHooks: {
        afterCreateOrganization: async ({ organization: org }) => {
          const ctx = await auth.$context;
          await provisionDefaultRoles(org.id, ctx.adapter);
        },
      },
      invitationExpiresIn: 60 * 60 * 24 * 7,
      sendInvitationEmail: emitInvitationEmail,
    }),
  ],
});

import "dotenv/config";
import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { admin, organization } from "better-auth/plugins";
import { sharedAuthEvents } from "../providers/auth-events.provider";
import { ac, roles } from "~/club/config/roles.config";

type AuthEmailArgs = {
  user: { email: string; name?: string };
  url: string;
  token: string;
};

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

export const auth = betterAuth({
  baseURL: `http://localhost:${process.env.PORT ?? 3000}`,
  trustedOrigins: [process.env.FRONT_ORIGIN ?? "http://localhost:3000"],
  basePath: "/api/auth",
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
      creatorRole: "owner",
      ac,
      roles,
      dynamicAccessControl: {
        enabled: true,
        maximumRolesPerOrganization: 25,
      },
    }),
  ],
});

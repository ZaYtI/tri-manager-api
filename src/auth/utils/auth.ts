import "dotenv/config";
import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { admin, organization } from "better-auth/plugins";
import { sharedAuthEvents } from "../providers/auth-events.provider";

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
  hooks: {},
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 40,
    revokeSessionsOnPasswordReset: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    enabled: true,
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({
      user,
      url,
      token,
    }: {
      user: { email: string; name?: string };
      url: string;
      token: string;
    }) => {
      sharedAuthEvents.emit("verify-email", {
        email: user.email,
        name: user.name ?? user.email,
        url,
        token,
      });
      return Promise.resolve();
    },
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
    organization({
      allowUserToCreateOrganization: (user) => {
        return user.role === "admin";
      },
      roleConfig: {
        owner: { permissions: ["*"] },
        coach: {
          permissions: [
            "training:create",
            "training:update",
            "training:delete",
          ],
        },
        athlete: {
          permissions: ["training:read", "training:join"],
        },
      },
    }),
  ],
});

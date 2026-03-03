import "dotenv/config";
import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { admin, organization } from "better-auth/plugins";
import { EventEmitter } from "events";

export const authEvents = new EventEmitter();

export const auth = betterAuth({
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
    sendResetPassword: ({ user, url, token }) => {
      authEvents.emit("reset-password", {
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
    organization(),
  ],
});

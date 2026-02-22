import "dotenv/config";
import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { admin, organization } from "better-auth/plugins";

export const auth = betterAuth({
  database: new Pool({
    host: process.env.DATABASE_HOST,
    port: Number.parseInt(process.env.DATABASE_PORT || "5432"),
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
    organization(),
  ],
});

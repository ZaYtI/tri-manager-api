import "dotenv/config";
import { Pool } from "pg";

const FORCE = process.argv.includes("--force");

if (process.env.NODE_ENV === "production" && !FORCE) {
  console.error(
    "Refus de vider la base en production. Utilise --force si tu es sûr.",
  );
  process.exit(1);
}

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: Number.parseInt(process.env.DATABASE_PORT || "5432", 10),
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

async function main() {
  console.log("Vidage de la base…");
  await pool.query(`
    TRUNCATE TABLE
      "invitation",
      "member",
      "verification",
      "account",
      "session",
      "organization",
      "user"
    RESTART IDENTITY CASCADE;
  `);
  console.log("Base vidée ✅");
}

main()
  .catch((err) => {
    console.error("Reset en échec :", err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());

import "dotenv/config";
import { execFileSync } from "child_process";
import { Pool } from "pg";
import { auth } from "./auth/utils/auth";

/**
 * Seeder de la base de données.
 *
 * Par défaut : applique les migrations better-auth, vide toutes les tables
 * (better-auth + métier) puis réinsère un jeu de données de démonstration
 * cohérent.
 *
 *   npm run seed               -> migrate + reset + seed
 *   npm run seed -- --no-migrate -> saute les migrations better-auth
 *   npm run seed -- --no-reset   -> seed uniquement (sans vider)
 *   npm run seed -- --reset-only -> migrate + vide uniquement
 *   npm run db:migrate          -> migrations better-auth uniquement
 *
 * Sécurité : refuse de s'exécuter si NODE_ENV === "production"
 * (contourner avec --force si vraiment nécessaire).
 */

const args = process.argv.slice(2);
const NO_MIGRATE = args.includes("--no-migrate");
const NO_RESET = args.includes("--no-reset");
const RESET_ONLY = args.includes("--reset-only");
const FORCE = args.includes("--force");

const AUTH_CONFIG_PATH = "src/auth/utils/auth.ts";

if (process.env.NODE_ENV === "production" && !FORCE) {
  console.error(
    "Refus d'exécuter le seeder en production. Utilise --force si tu es sûr.",
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

const DEFAULT_PASSWORD = "Password123!";

interface SeedOrg {
  name: string;
  slug: string;
  owner: { name: string; email: string };
}

const ORGS: SeedOrg[] = [
  {
    name: "Tri Club Lyon",
    slug: "tri-club-lyon",
    owner: { name: "Camille Durand", email: "owner.lyon@tri-manager.com" },
  },
  {
    name: "Aquatri Bordeaux",
    slug: "aquatri-bordeaux",
    owner: { name: "Antoine Lefevre", email: "owner.bordeaux@tri-manager.com" },
  },
];

function migrate() {
  console.log("Migrations better-auth…");
  const cliEntry = require.resolve("@better-auth/cli");
  execFileSync(
    process.execPath,
    [cliEntry, "migrate", "--config", AUTH_CONFIG_PATH, "-y"],
    { stdio: "inherit" },
  );
  console.log("Migrations appliquées.");
}

async function reset() {
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
  console.log("Base vidée.");
}

async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "user";
}): Promise<string> {
  const res = (await auth.api.createUser({
    body: {
      name: input.name,
      email: input.email,
      password: input.password,
      role: input.role ?? "user",
      data: { emailVerified: true },
    },
  })) as { user: { id: string } };
  return res.user.id;
}

async function seed() {
  console.log("Seeding…");

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@monapp.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? DEFAULT_PASSWORD;
  await createUser({
    name: "Admin",
    email: adminEmail,
    password: adminPassword,
    role: "admin",
  });
  console.log(`  Admin : ${adminEmail} / ${adminPassword}`);

  for (const org of ORGS) {
    const ownerId = await createUser({
      name: org.owner.name,
      email: org.owner.email,
      password: DEFAULT_PASSWORD,
    });

    const created = (await auth.api.createOrganization({
      body: { name: org.name, slug: org.slug, userId: ownerId },
    })) as { id: string } | null;

    if (!created) throw new Error(`Échec création orga ${org.slug}`);
    console.log(
      `  Orga : ${org.name} (${org.slug}) — owner ${org.owner.email}`,
    );
  }

  console.log(
    `\nTous les comptes de démo utilisent le mot de passe : ${DEFAULT_PASSWORD}`,
  );
}

async function main() {
  try {
    if (!NO_MIGRATE) migrate();
    if (!NO_RESET) await reset();
    if (!RESET_ONLY) await seed();
    console.log("\nTerminé ✅");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Seeder en échec :", err);
  process.exit(1);
});

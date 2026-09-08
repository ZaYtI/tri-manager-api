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

type SeedRole = "coach" | "athlete";

interface SeedPerson {
  name: string;
  email: string;
  role: SeedRole;
  speciality?: string;
  licenseNumber?: string;
}

interface SeedOrg {
  name: string;
  slug: string;
  owner: { name: string; email: string };
  people: SeedPerson[];
}

const ORGS: SeedOrg[] = [
  {
    name: "Tri Club Lyon",
    slug: "tri-club-lyon",
    owner: { name: "Camille Durand", email: "owner.lyon@tri-manager.com" },
    people: [
      {
        name: "Julien Martin",
        email: "coach.julien@tri-manager.com",
        role: "coach",
        speciality: "Natation",
      },
      {
        name: "Sophie Bernard",
        email: "coach.sophie@tri-manager.com",
        role: "coach",
        speciality: "Course à pied",
      },
      {
        name: "Lucas Petit",
        email: "athlete.lucas@tri-manager.com",
        role: "athlete",
        licenseNumber: "LYON-0001",
      },
      {
        name: "Emma Roux",
        email: "athlete.emma@tri-manager.com",
        role: "athlete",
        licenseNumber: "LYON-0002",
      },
      {
        name: "Nathan Moreau",
        email: "athlete.nathan@tri-manager.com",
        role: "athlete",
        licenseNumber: "LYON-0003",
      },
      {
        name: "Léa Fournier",
        email: "athlete.lea@tri-manager.com",
        role: "athlete",
        licenseNumber: "LYON-0004",
      },
    ],
  },
  {
    name: "Aquatri Bordeaux",
    slug: "aquatri-bordeaux",
    owner: { name: "Antoine Lefevre", email: "owner.bordeaux@tri-manager.com" },
    people: [
      {
        name: "Marie Girard",
        email: "coach.marie@tri-manager.com",
        role: "coach",
        speciality: "Cyclisme",
      },
      {
        name: "Thomas Bonnet",
        email: "athlete.thomas@tri-manager.com",
        role: "athlete",
        licenseNumber: "BDX-0001",
      },
      {
        name: "Chloé Dupuis",
        email: "athlete.chloe@tri-manager.com",
        role: "athlete",
        licenseNumber: "BDX-0002",
      },
      {
        name: "Hugo Lambert",
        email: "athlete.hugo@tri-manager.com",
        role: "athlete",
        licenseNumber: "BDX-0003",
      },
    ],
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
      "athlete",
      "coach",
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
    const organizationId = created.id;
    console.log(
      `  Orga : ${org.name} (${org.slug}) — owner ${org.owner.email}`,
    );

    for (const person of org.people) {
      const userId = await createUser({
        name: person.name,
        email: person.email,
        password: DEFAULT_PASSWORD,
      });

      const member = (await auth.api.addMember({
        // `coach` / `athlete` viennent du roleConfig custom : les types
        // statiques de better-auth ne connaissent que admin/member/owner.
        body: { userId, organizationId, role: person.role as "member" },
      })) as { id: string } | null;

      if (!member) throw new Error(`Échec ajout membre ${person.email}`);

      if (person.role === "coach") {
        await pool.query(
          `INSERT INTO "coach" ("memberId", "speciality", "status") VALUES ($1, $2, 'active')`,
          [member.id, person.speciality ?? null],
        );
      } else {
        await pool.query(
          `INSERT INTO "athlete" ("memberId", "licenseNumber", "status") VALUES ($1, $2, 'active')`,
          [member.id, person.licenseNumber ?? null],
        );
      }

      console.log(`    - ${person.role.padEnd(7)} ${person.email}`);
    }
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

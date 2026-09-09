import { faker } from "@faker-js/faker";
import { DataSource } from "typeorm";
import type { Seeder } from "typeorm-extension";

import { ensureAdmin } from "../auth-seeding";
import { DEFAULT_SEED_PASSWORD } from "../builders/user.builder";
import { makeOrganization } from "../builders/organization.builder";

const num = (key: string, fallback: number) =>
  Number.parseInt(process.env[key] ?? String(fallback), 10);

const ORG_COUNT = num("SEED_ORG_COUNT", 3);
const MIN_COACHES = num("SEED_MIN_COACHES", 1);
const MAX_COACHES = num("SEED_MAX_COACHES", 2);
const MIN_ATHLETES = num("SEED_MIN_ATHLETES", 4);
const MAX_ATHLETES = num("SEED_MAX_ATHLETES", 10);

export class MainSeeder implements Seeder {
  track = false;

  async run(dataSource: DataSource): Promise<void> {
    console.log("Seeding…");

    await ensureAdmin(dataSource);

    for (let i = 0; i < ORG_COUNT; i++) {
      const coaches = faker.number.int({ min: MIN_COACHES, max: MAX_COACHES });
      const athletes = faker.number.int({
        min: MIN_ATHLETES,
        max: MAX_ATHLETES,
      });
      const { id, coachIds, athleteIds } = await makeOrganization({
        coaches,
        athletes,
      });
      console.log(
        `  Orga ${i + 1}/${ORG_COUNT} — ${id} — 1 président, ${coachIds.length} coach(s), ${athleteIds.length} athlète(s)`,
      );
    }

    console.log(
      `\nMot de passe de tous les comptes de démo : ${DEFAULT_SEED_PASSWORD}`,
    );
  }
}

export default MainSeeder;

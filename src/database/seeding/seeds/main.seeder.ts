import { faker } from "@faker-js/faker";
import { DataSource } from "typeorm";
import type { Seeder } from "typeorm-extension";

import { ensureAdmin } from "../auth-seeding";
import { DEFAULT_SEED_PASSWORD } from "../builders/user.builder";
import { makeOrganization } from "../builders/organization.builder";

const ORG_COUNT = Number.parseInt(process.env.SEED_ORG_COUNT ?? "3", 10);
const MIN_MEMBERS = Number.parseInt(process.env.SEED_MIN_MEMBERS ?? "1", 10);
const MAX_MEMBERS = Number.parseInt(process.env.SEED_MAX_MEMBERS ?? "5", 10);

export class MainSeeder implements Seeder {
  track = false;

  async run(dataSource: DataSource): Promise<void> {
    console.log("Seeding…");

    await ensureAdmin(dataSource);

    for (let i = 0; i < ORG_COUNT; i++) {
      const members = faker.number.int({ min: MIN_MEMBERS, max: MAX_MEMBERS });
      const { id, memberIds } = await makeOrganization({ members });
      console.log(
        `  Orga ${i + 1}/${ORG_COUNT} — ${id} (${memberIds.length} membres)`,
      );
    }

    console.log(
      `\nMot de passe de tous les comptes de démo : ${DEFAULT_SEED_PASSWORD}`,
    );
  }
}

export default MainSeeder;

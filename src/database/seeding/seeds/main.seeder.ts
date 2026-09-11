import { faker } from "@faker-js/faker";
import { DataSource } from "typeorm";
import type { Seeder } from "typeorm-extension";

import { ensureAdmin } from "../auth-seeding";
import { DEFAULT_SEED_PASSWORD } from "../builders/user.builder";
import { makeOrganization } from "../builders/organization.builder";
import { makeMultiOrgUser } from "../builders/multi-org-user.builder";
import type { OrgRoleName } from "../../../organization/role/config/access-control";

const num = (key: string, fallback: number) =>
  Number.parseInt(process.env[key] ?? String(fallback), 10);

const ORG_COUNT = num("SEED_ORG_COUNT", 3);
const MIN_COACHES = num("SEED_MIN_COACHES", 1);
const MAX_COACHES = num("SEED_MAX_COACHES", 2);
const MIN_ATHLETES = num("SEED_MIN_ATHLETES", 4);
const MAX_ATHLETES = num("SEED_MAX_ATHLETES", 10);
const MULTI_ORG_USER_COUNT = num("SEED_MULTI_ORG_USERS", 3);

const MULTI_ORG_ROLE_CYCLE: OrgRoleName[] = ["president", "coach", "athlete"];

export class MainSeeder implements Seeder {
  track = false;

  async run(dataSource: DataSource): Promise<void> {
    console.log("Seeding…");

    await ensureAdmin(dataSource);

    const organizations: { id: string; name: string }[] = [];

    for (let i = 0; i < ORG_COUNT; i++) {
      const coaches = faker.number.int({ min: MIN_COACHES, max: MAX_COACHES });
      const athletes = faker.number.int({
        min: MIN_ATHLETES,
        max: MAX_ATHLETES,
      });
      const { id, name, coachIds, athleteIds } = await makeOrganization({
        coaches,
        athletes,
      });
      organizations.push({ id, name });
      console.log(
        `  Orga ${i + 1}/${ORG_COUNT} — ${name} (${id}) — 1 président, ${coachIds.length} coach(s), ${athleteIds.length} athlète(s)`,
      );
    }

    if (organizations.length >= 2) {
      console.log(
        `\nUtilisateurs multi-organisations (rôle — donc droits — différent par club) :`,
      );
      for (let i = 0; i < MULTI_ORG_USER_COUNT; i++) {
        const email = `multi-org-${i + 1}@tri-manager.test`;
        const name = `Multi Org ${i + 1}`;
        const assignments = organizations.map((org, orgIndex) => ({
          organizationId: org.id,
          organizationName: org.name,
          role: MULTI_ORG_ROLE_CYCLE[
            (orgIndex + i) % MULTI_ORG_ROLE_CYCLE.length
          ],
        }));

        await makeMultiOrgUser(name, email, assignments);

        const summary = assignments
          .map((a) => `${a.organizationName}=${a.role}`)
          .join(", ");
        console.log(`  ${name} <${email}> — ${summary}`);
      }
    }

    console.log(
      `\nMot de passe de tous les comptes de démo : ${DEFAULT_SEED_PASSWORD}`,
    );
  }
}

export default MainSeeder;

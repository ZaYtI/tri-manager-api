import { faker } from "@faker-js/faker";

import { addMember, createOrganization, SeedUserInput } from "../auth-seeding";
import { makeUser } from "./user.builder";

export interface OrganizationInput {
  name: string;
  slug: string;
}

export function buildOrganization(
  overrides: Partial<OrganizationInput> = {},
): OrganizationInput {
  const name = overrides.name ?? `${faker.company.name()} Triathlon`;
  const slug =
    overrides.slug ??
    `${faker.helpers.slugify(name).toLowerCase()}-${faker.string
      .alphanumeric(4)
      .toLowerCase()}`;
  return { name, slug };
}

export interface MakeOrganizationOptions {
  organization?: Partial<OrganizationInput>;
  president?: Partial<SeedUserInput>;
  coaches?: number;
  athletes?: number;
}

export async function makeOrganization(
  options: MakeOrganizationOptions = {},
): Promise<{
  id: string;
  presidentId: string;
  coachIds: string[];
  athleteIds: string[];
}> {
  const { id: presidentId } = await makeUser(options.president);
  const { name, slug } = buildOrganization(options.organization);
  const id = await createOrganization({ name, slug, creatorId: presidentId });

  const coachIds: string[] = [];
  for (let i = 0; i < (options.coaches ?? 0); i++) {
    const { id: userId } = await makeUser();
    coachIds.push(
      await addMember({ userId, organizationId: id, role: "coach" }),
    );
  }

  const athleteIds: string[] = [];
  for (let i = 0; i < (options.athletes ?? 0); i++) {
    const { id: userId } = await makeUser();
    athleteIds.push(
      await addMember({ userId, organizationId: id, role: "athlete" }),
    );
  }

  return { id, presidentId, coachIds, athleteIds };
}

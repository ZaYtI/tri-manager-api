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
  owner?: Partial<SeedUserInput>;
  members?: number;
}

export async function makeOrganization(
  options: MakeOrganizationOptions = {},
): Promise<{
  id: string;
  ownerId: string;
  memberIds: string[];
}> {
  const { id: ownerId } = await makeUser(options.owner);
  const { name, slug } = buildOrganization(options.organization);
  const id = await createOrganization({ name, slug, ownerId });

  const memberIds: string[] = [];
  for (let i = 0; i < (options.members ?? 0); i++) {
    const { id: userId } = await makeUser();
    memberIds.push(
      await addMember({ userId, organizationId: id, role: "member" }),
    );
  }

  return { id, ownerId, memberIds };
}

import { faker } from "@faker-js/faker";
import { createUser, SeedUserInput } from "../auth-seeding";

export const DEFAULT_SEED_PASSWORD = "Password123!";

export function buildUser(
  overrides: Partial<SeedUserInput> = {},
): SeedUserInput {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  return {
    name: `${firstName} ${lastName}`,
    email: faker.internet
      .email({ firstName, lastName, provider: "tri-manager.test" })
      .toLowerCase(),
    password: DEFAULT_SEED_PASSWORD,
    role: "user",
    emailVerified: true,
    ...overrides,
  };
}

export async function makeUser(
  overrides: Partial<SeedUserInput> = {},
): Promise<{ id: string; input: SeedUserInput }> {
  const input = buildUser(overrides);
  const id = await createUser(input);
  return { id, input };
}

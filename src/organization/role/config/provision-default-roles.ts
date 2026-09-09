import { DEFAULT_ORG_ROLES } from "./access-control";

interface AdapterLike {
  create: (args: {
    model: string;
    data: Record<string, unknown>;
  }) => Promise<unknown>;
}

export async function provisionDefaultRoles(
  organizationId: string,
  adapter: AdapterLike,
): Promise<void> {
  for (const { role, permission } of DEFAULT_ORG_ROLES) {
    await adapter.create({
      model: "organizationRole",
      data: {
        organizationId,
        role,
        permission: JSON.stringify(permission),
        createdAt: new Date(),
      },
    });
  }
}

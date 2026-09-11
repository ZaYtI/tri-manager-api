import { addMember } from "../auth-seeding";
import type { OrgRoleName } from "../../../organization/role/config/access-control";
import { makeUser } from "./user.builder";

export interface MultiOrgAssignment {
  organizationId: string;
  organizationName: string;
  role: OrgRoleName;
}

export async function makeMultiOrgUser(
  name: string,
  email: string,
  assignments: MultiOrgAssignment[],
): Promise<{ id: string; name: string; email: string }> {
  const { id } = await makeUser({ name, email });

  for (const { organizationId, role } of assignments) {
    await addMember({ userId: id, organizationId, role });
  }

  return { id, name, email };
}

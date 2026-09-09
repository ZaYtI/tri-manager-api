import { orgRoles } from "./access-control";
import { OrgRoleView } from "../role.types";
import { RolePermission } from "../dto/role.dto";

export const STATIC_ROLES: OrgRoleView[] = Object.entries(orgRoles).map(
  ([role, definition]) => ({
    role,
    permission: (definition.statements ?? {}) as RolePermission,
    system: true,
  }),
);

import { RolePermission } from "./dto/role.dto";

export interface OrgRoleView {
  id?: string;
  role: string;
  permission: RolePermission;
  system: boolean;
}

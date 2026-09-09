export type RolePermission = Record<string, string[]>;

export class CreateRoleDto {
  role: string;
  permission: RolePermission;
}

export class UpdateRoleDto {
  permission: RolePermission;
}

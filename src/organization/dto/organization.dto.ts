import { OrgPermissions } from "../config/roles.config";

export class CreateOrganizationDto {
  name: string;
  slug: string;
  ownerId: string;
}

export class UpdateOrganizationDto {
  name?: string;
  slug?: string;
}

export class InviteMemberDto {
  email: string;
  role: string;
}

export class MemberRoleDto {
  role: string;
}

export class CreateRoleDto {
  role: string;
  permissions: OrgPermissions;
}

export class UpdateRoleDto {
  permissions: OrgPermissions;
}

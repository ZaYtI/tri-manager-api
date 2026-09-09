import { ClubPermissions } from "../config/roles.config";

export class CreateClubDto {
  name: string;
  slug: string;
  ownerId: string;
}

export class UpdateClubDto {
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
  permissions: ClubPermissions;
}

export class UpdateRoleDto {
  permissions: ClubPermissions;
}

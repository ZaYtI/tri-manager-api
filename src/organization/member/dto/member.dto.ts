import { OrgRoleName } from "~/organization/role/config/access-control";

export type MemberRole = OrgRoleName;

export class AddMemberDto {
  userId: string;
  role?: MemberRole;
}

export class UpdateMemberRoleDto {
  role: MemberRole;
}

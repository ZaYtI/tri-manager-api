import { OrgRoleName } from "~/organization/role/config/access-control";

export type InvitationRole = OrgRoleName;

export class CreateInvitationDto {
  email: string;
  role?: InvitationRole;
  resend?: boolean;
}

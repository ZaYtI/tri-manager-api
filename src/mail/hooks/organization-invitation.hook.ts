import { Injectable } from "@nestjs/common";
import { Hook, AfterHook } from "@thallesp/nestjs-better-auth";
import type { AuthHookContext } from "@thallesp/nestjs-better-auth";
import { MailService } from "../mail.service";
import { OrganizationInvitationBody } from "../interfaces/organization-invitation-body.interface";

@Hook()
@Injectable()
export class OrganizationInvitationHook {
  constructor(private readonly mailService: MailService) {}

  @AfterHook("/organization/invite-member")
  async handle(ctx: AuthHookContext) {
    const body = ctx.body as OrganizationInvitationBody;
    const email = body.email;
    const invitedByName = body.inviterName;
    const invitedByEmail = body.inviterEmail;
    const organizationName =
      body.organizationName ?? body.orgName ?? "l'organisation";
    const inviteLink = body.inviteLink;

    if (!email) {
      console.warn("[OrganizationInvitationHook] Missing email in context");
      return;
    }

    await this.mailService.sendOrganizationInvitation({
      email,
      invitedByName: invitedByName ?? "Un membre",
      invitedByEmail: invitedByEmail ?? "",
      organizationName,
      inviteLink: inviteLink ?? "",
    });
  }
}

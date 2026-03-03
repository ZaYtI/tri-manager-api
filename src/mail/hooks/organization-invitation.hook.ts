import { Injectable } from "@nestjs/common";
import { Hook, AfterHook } from "@thallesp/nestjs-better-auth";
import type { AuthHookContext } from "@thallesp/nestjs-better-auth";
import { MailService } from "../mail.service";

@Hook()
@Injectable()
export class OrganizationInvitationHook {
  constructor(private readonly mailService: MailService) {}

  @AfterHook("/organization/invite-member")
  async handle(ctx: AuthHookContext) {
    const email = ctx.body?.email;
    const invitedByName = ctx.body?.inviterName ?? ctx.body?.invitedByName;
    const invitedByEmail = ctx.body?.inviterEmail ?? ctx.body?.invitedByEmail;
    const organizationName =
      ctx.body?.organizationName ?? ctx.body?.orgName ?? "l'organisation";
    const inviteLink = ctx.context?.url ?? ctx.body?.inviteLink;

    if (!email) {
      console.warn("[OrganizationInvitationHook] Missing email in context");
      return;
    }

    await this.mailService.sendOrganizationInvitation({
      email,
      invitedByName: invitedByName ?? "Un membre",
      invitedByEmail: invitedByEmail ?? "",
      organizationName,
      inviteLink: inviteLink ?? "#",
    });
  }
}

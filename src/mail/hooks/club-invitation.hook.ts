import { Injectable } from "@nestjs/common";
import { Hook, AfterHook } from "@thallesp/nestjs-better-auth";
import type { AuthHookContext } from "@thallesp/nestjs-better-auth";
import { MailService } from "../mail.service";
import { ClubInvitationBody } from "../interfaces/club-invitation-body.interface";

@Hook()
@Injectable()
export class ClubInvitationHook {
  constructor(private readonly mailService: MailService) {}

  @AfterHook("/organization/invite-member")
  async handle(ctx: AuthHookContext) {
    const body = ctx.body as ClubInvitationBody;
    const email = body.email;
    const invitedByName = body.inviterName;
    const invitedByEmail = body.inviterEmail;
    const clubName = body.clubName ?? "le club";
    const inviteLink = body.inviteLink;

    if (!email) {
      console.warn("[ClubInvitationHook] Missing email in context");
      return;
    }

    await this.mailService.sendClubInvitation({
      email,
      invitedByName: invitedByName ?? "Un membre",
      invitedByEmail: invitedByEmail ?? "",
      clubName,
      inviteLink: inviteLink ?? "",
    });
  }
}

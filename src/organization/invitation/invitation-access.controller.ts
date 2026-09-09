import { Controller, Get, Param, Post } from "@nestjs/common";
import { Public } from "@thallesp/nestjs-better-auth";

import { BetterAuthHeaders } from "~/auth/decorators/better-auth-headers.decorator";
import { InvitationService } from "./invitation.service";

@Controller("invitations")
export class InvitationAccessController {
  constructor(private readonly invitations: InvitationService) {}

  @Get(":id")
  @Public()
  getPublic(@Param("id") id: string) {
    return this.invitations.getPublic(id);
  }

  @Post(":id/accept")
  accept(@Param("id") id: string, @BetterAuthHeaders() headers: Headers) {
    return this.invitations.accept(id, headers);
  }

  @Post(":id/reject")
  reject(@Param("id") id: string, @BetterAuthHeaders() headers: Headers) {
    return this.invitations.reject(id, headers);
  }
}

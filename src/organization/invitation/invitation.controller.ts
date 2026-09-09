import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@thallesp/nestjs-better-auth";

import { BetterAuthHeaders } from "~/auth/decorators/better-auth-headers.decorator";
import { InvitationService } from "./invitation.service";
import { CreateInvitationDto } from "./dto/invitation.dto";

@Controller("organizations/:orgId/invitations")
@UseGuards(AuthGuard)
export class InvitationController {
  constructor(private readonly invitations: InvitationService) {}

  @Get()
  findAll(
    @Param("orgId") orgId: string,
    @BetterAuthHeaders() headers: Headers,
  ) {
    return this.invitations.findAll(orgId, headers);
  }

  @Post()
  create(
    @Param("orgId") orgId: string,
    @Body() body: CreateInvitationDto,
    @BetterAuthHeaders() headers: Headers,
  ) {
    return this.invitations.create(orgId, body, headers);
  }

  @Delete(":invitationId")
  cancel(
    @Param("invitationId") invitationId: string,
    @BetterAuthHeaders() headers: Headers,
  ) {
    return this.invitations.cancel(invitationId, headers);
  }
}

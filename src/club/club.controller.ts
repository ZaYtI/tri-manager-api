import { Controller, Get, UseGuards } from "@nestjs/common";
import {
  AuthGuard,
  Session,
  type UserSession,
} from "@thallesp/nestjs-better-auth";

import { ClubService } from "./club.service";

@Controller("club")
@UseGuards(AuthGuard)
export class ClubController {
  constructor(private readonly club: ClubService) {}

  @Get("me")
  me(@Session() session: UserSession) {
    return this.club.getSpaceForCaller(
      session.user.id,
      session.session.activeOrganizationId,
    );
  }
}

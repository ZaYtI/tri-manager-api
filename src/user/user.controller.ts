import { Controller, Get } from "@nestjs/common";
import { Session } from "@thallesp/nestjs-better-auth";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get("me")
  getProfile(@Session() session: UserSession) {
    return session;
  }
}

import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import {
  AuthGuard,
  Roles,
  Session,
  type UserSession,
} from "@thallesp/nestjs-better-auth";
import { UserService } from "./user.service";

@Controller("users")
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("send-verification")
  @Roles(["admin"])
  sendVerification(@Body("email") email: string) {
    return this.userService.sendVerificationEmail(email);
  }

  @Get("me/organizations")
  findMyOrganizations(@Session() session: UserSession) {
    return this.userService.findOrganizations(session.user.id);
  }

  @Get(":id")
  @Roles(["admin"])
  findOne(@Param("id") id: string) {
    return this.userService.findOne(id);
  }

  @Get(":id/organizations")
  @Roles(["admin"])
  findOrganizations(@Param("id") id: string) {
    return this.userService.findOrganizations(id);
  }
}

import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AuthGuard, Roles } from "@thallesp/nestjs-better-auth";
import { UserService } from "./user.service";

@Controller("users")
@UseGuards(AuthGuard)
@Roles(["admin"])
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("send-verification")
  sendVerification(@Body("email") email: string) {
    return this.userService.sendVerificationEmail(email);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.userService.findOne(id);
  }

  @Get(":id/organizations")
  findOrganizations(@Param("id") id: string) {
    return this.userService.findOrganizations(id);
  }
}

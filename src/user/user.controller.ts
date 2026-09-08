import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { AuthGuard, Roles } from "@thallesp/nestjs-better-auth";
import { UserService } from "./user.service";

@Controller("users")
@UseGuards(AuthGuard)
@Roles(["admin"])
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.userService.findOne(id);
  }
}

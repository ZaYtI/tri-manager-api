import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@thallesp/nestjs-better-auth";

import { BetterAuthHeaders } from "~/auth/decorators/better-auth-headers.decorator";
import { RoleService } from "./role.service";
import { CreateRoleDto, UpdateRoleDto } from "./dto/role.dto";

@Controller("organizations/:orgId/roles")
@UseGuards(AuthGuard)
export class RoleController {
  constructor(private readonly roles: RoleService) {}

  @Get("catalog")
  catalog() {
    return this.roles.catalog();
  }

  @Get()
  findAll(
    @Param("orgId") orgId: string,
    @BetterAuthHeaders() headers: Headers,
  ) {
    return this.roles.findAll(orgId, headers);
  }

  @Get(":roleName")
  findOne(
    @Param("orgId") orgId: string,
    @Param("roleName") roleName: string,
    @BetterAuthHeaders() headers: Headers,
  ) {
    return this.roles.findOne(orgId, roleName, headers);
  }

  @Post()
  create(
    @Param("orgId") orgId: string,
    @Body() body: CreateRoleDto,
    @BetterAuthHeaders() headers: Headers,
  ) {
    return this.roles.create(orgId, body, headers);
  }

  @Patch(":roleName")
  update(
    @Param("orgId") orgId: string,
    @Param("roleName") roleName: string,
    @Body() body: UpdateRoleDto,
    @BetterAuthHeaders() headers: Headers,
  ) {
    return this.roles.update(orgId, roleName, body.permission, headers);
  }

  @Delete(":roleName")
  remove(
    @Param("orgId") orgId: string,
    @Param("roleName") roleName: string,
    @BetterAuthHeaders() headers: Headers,
  ) {
    return this.roles.remove(orgId, roleName, headers);
  }
}

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
import { Paginate, PaginateQuery } from "nestjs-paginate";
import { AuthGuard, Roles } from "@thallesp/nestjs-better-auth";

import { OrganizationService } from "./organization.service";
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from "./dto/organization.dto";

@Controller("organizations")
@UseGuards(AuthGuard)
@Roles(["admin"])
export class OrganizationController {
  constructor(private readonly organizations: OrganizationService) {}

  @Get()
  findAll(@Paginate() query: PaginateQuery) {
    return this.organizations.findAll(query);
  }

  @Post()
  create(@Body() body: CreateOrganizationDto) {
    return this.organizations.create(body.name, body.slug, body.ownerId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.organizations.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: UpdateOrganizationDto) {
    return this.organizations.update(id, body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.organizations.remove(id);
  }
}

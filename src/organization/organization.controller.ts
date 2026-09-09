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

import { CurrentActor } from "~/audit/current-actor.decorator";
import { AuditActor } from "~/audit/audit.types";
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
  create(
    @Body() body: CreateOrganizationDto,
    @CurrentActor() actor: AuditActor,
  ) {
    return this.organizations.create(body.name, body.slug, body.ownerId, actor);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.organizations.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() body: UpdateOrganizationDto,
    @CurrentActor() actor: AuditActor,
  ) {
    return this.organizations.update(id, body, actor);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @CurrentActor() actor: AuditActor) {
    return this.organizations.remove(id, actor);
  }
}

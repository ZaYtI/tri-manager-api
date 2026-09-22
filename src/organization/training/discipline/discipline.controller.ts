import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@thallesp/nestjs-better-auth";

import { OrgPermissionGuard } from "~/auth/guards/org-permission.guard";
import { RequireOrgPermission } from "~/auth/decorators/require-org-permission.decorator";
import { DisciplineService } from "./discipline.service";
import { CreateDisciplineDto } from "./dto/create-discipline.dto";

@Controller("organizations/:orgId/disciplines")
@UseGuards(AuthGuard, OrgPermissionGuard)
export class DisciplineController {
  constructor(private readonly disciplines: DisciplineService) {}

  @Get()
  @RequireOrgPermission({ training: [] })
  findAll(@Param("orgId") orgId: string) {
    return this.disciplines.findAll(orgId);
  }

  @Post()
  @RequireOrgPermission({ training: ["create"] })
  create(@Param("orgId") orgId: string, @Body() body: CreateDisciplineDto) {
    return this.disciplines.create(orgId, body.name);
  }
}

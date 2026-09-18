import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@thallesp/nestjs-better-auth";
import { Paginate, PaginateQuery } from "nestjs-paginate";

import { OrgPermissionGuard } from "~/auth/guards/org-permission.guard";
import { RequireOrgPermission } from "~/auth/decorators/require-org-permission.decorator";
import { TeamService } from "./team.service";

@Controller("organizations/:orgId/teams")
@UseGuards(AuthGuard, OrgPermissionGuard)
export class TeamController {
  constructor(private readonly teams: TeamService) {}

  @Get()
  @RequireOrgPermission({ team: [] })
  findAll(@Param("orgId") orgId: string, @Paginate() query: PaginateQuery) {
    return this.teams.findAll(orgId, query);
  }

  @Get(":teamId/members")
  @RequireOrgPermission({ member: [] })
  listMembers(
    @Param("orgId") orgId: string,
    @Param("teamId") teamId: string,
  ) {
    return this.teams.listMembers(orgId, teamId);
  }
}

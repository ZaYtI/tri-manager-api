import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@thallesp/nestjs-better-auth";

import { OrgPermissionGuard } from "~/auth/guards/org-permission.guard";
import { RequireOrgPermission } from "~/auth/decorators/require-org-permission.decorator";
import { LocationService } from "./location.service";
import { CreateLocationDto } from "./dto/create-location.dto";

@Controller("organizations/:orgId/locations")
@UseGuards(AuthGuard, OrgPermissionGuard)
export class LocationController {
  constructor(private readonly locations: LocationService) {}

  @Get()
  @RequireOrgPermission({ training: [] })
  findAll(@Param("orgId") orgId: string) {
    return this.locations.findAll(orgId);
  }

  @Get(":id")
  @RequireOrgPermission({ training: [] })
  findOne(@Param("orgId") orgId: string, @Param("id") id: string) {
    return this.locations.getOrFail(orgId, id);
  }

  @Post()
  @RequireOrgPermission({ training: ["create"] })
  create(@Param("orgId") orgId: string, @Body() body: CreateLocationDto) {
    return this.locations.create(orgId, body.name, body.address);
  }
}

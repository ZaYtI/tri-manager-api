import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@thallesp/nestjs-better-auth";
import { Paginate, PaginateQuery } from "nestjs-paginate";

import { OrgPermissionGuard } from "~/auth/guards/org-permission.guard";
import { RequireOrgPermission } from "~/auth/decorators/require-org-permission.decorator";
import { AuditService } from "./audit.service";

@Controller("organizations/:orgId/audit")
@UseGuards(AuthGuard, OrgPermissionGuard)
export class OrganizationAuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  @RequireOrgPermission({ organization: ["update"] })
  findAll(@Param("orgId") orgId: string, @Paginate() query: PaginateQuery) {
    return this.audit.findAllForOrganization(orgId, query);
  }
}

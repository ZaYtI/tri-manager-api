import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard, Roles } from "@thallesp/nestjs-better-auth";
import { Paginate, PaginateQuery } from "nestjs-paginate";

import { AuditService } from "./audit.service";

@Controller("audit")
@UseGuards(AuthGuard)
@Roles(["admin"])
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  findAll(@Paginate() query: PaginateQuery) {
    return this.audit.findAll(query);
  }
}

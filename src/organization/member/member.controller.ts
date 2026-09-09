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
import {
  AuthGuard,
  Session,
  type UserSession,
} from "@thallesp/nestjs-better-auth";
import { Paginate, PaginateQuery } from "nestjs-paginate";

import { OrgPermissionGuard } from "~/auth/guards/org-permission.guard";
import { RequireOrgPermission } from "~/auth/decorators/require-org-permission.decorator";
import { CurrentActor } from "~/audit/current-actor.decorator";
import { AuditActor } from "~/audit/audit.types";
import { MemberService } from "./member.service";
import { AddMemberDto, UpdateMemberRoleDto } from "./dto/member.dto";

@Controller("organizations/:orgId/members")
@UseGuards(AuthGuard, OrgPermissionGuard)
export class MemberController {
  constructor(private readonly members: MemberService) {}

  @Get("me")
  me(@Param("orgId") orgId: string, @Session() session: UserSession) {
    return this.members.getViewer(orgId, session);
  }

  @Get()
  @RequireOrgPermission({ member: [] })
  findAll(@Param("orgId") orgId: string, @Paginate() query: PaginateQuery) {
    return this.members.findAll(orgId, query);
  }

  @Get(":memberId")
  @RequireOrgPermission({ member: [] })
  findOne(@Param("orgId") orgId: string, @Param("memberId") memberId: string) {
    return this.members.findOne(orgId, memberId);
  }

  @Post()
  @RequireOrgPermission({ member: ["create"] })
  add(
    @Param("orgId") orgId: string,
    @Body() body: AddMemberDto,
    @CurrentActor() actor: AuditActor,
  ) {
    return this.members.add(orgId, body.userId, body.role, actor);
  }

  @Patch(":memberId")
  @RequireOrgPermission({ member: ["update"] })
  updateRole(
    @Param("orgId") orgId: string,
    @Param("memberId") memberId: string,
    @Body() body: UpdateMemberRoleDto,
    @CurrentActor() actor: AuditActor,
  ) {
    return this.members.updateRole(orgId, memberId, body.role, actor);
  }

  @Delete(":memberId")
  @RequireOrgPermission({ member: ["delete"] })
  remove(
    @Param("orgId") orgId: string,
    @Param("memberId") memberId: string,
    @CurrentActor() actor: AuditActor,
  ) {
    return this.members.remove(orgId, memberId, actor);
  }
}

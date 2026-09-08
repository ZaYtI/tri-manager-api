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
import {
  AuthGuard,
  Roles,
  Session,
  type UserSession,
} from "@thallesp/nestjs-better-auth";

import { OrganizationService } from "./organization.service";
import {
  CreateOrganizationDto,
  CreateRoleDto,
  InviteMemberDto,
  MemberRoleDto,
  UpdateOrganizationDto,
  UpdateRoleDto,
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

  @Get("permissions")
  getPermissions() {
    return this.organizations.getStatements();
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

  @Get(":id/roles")
  listRoles(@Param("id") id: string) {
    return this.organizations.listRoles(id);
  }

  @Post(":id/roles")
  createRole(@Param("id") id: string, @Body() body: CreateRoleDto) {
    return this.organizations.createRole(id, body);
  }

  @Patch(":id/roles/:roleId")
  updateRole(
    @Param("id") id: string,
    @Param("roleId") roleId: string,
    @Body() body: UpdateRoleDto,
  ) {
    return this.organizations.updateRole(id, roleId, body);
  }

  @Delete(":id/roles/:roleId")
  deleteRole(@Param("id") id: string, @Param("roleId") roleId: string) {
    return this.organizations.deleteRole(id, roleId);
  }

  @Get(":id/invitations")
  listInvitations(@Param("id") id: string) {
    return this.organizations.listInvitations(id);
  }

  @Post(":id/members/invite")
  invite(
    @Param("id") id: string,
    @Body() body: InviteMemberDto,
    @Session() session: UserSession,
  ) {
    return this.organizations.inviteMember(
      id,
      body.email,
      body.role,
      session.user.id,
    );
  }

  @Delete(":id/invitations/:invitationId")
  cancelInvitation(
    @Param("id") id: string,
    @Param("invitationId") invitationId: string,
  ) {
    return this.organizations.cancelInvitation(id, invitationId);
  }

  @Patch(":id/members/:memberId")
  updateMemberRole(
    @Param("id") id: string,
    @Param("memberId") memberId: string,
    @Body() body: MemberRoleDto,
  ) {
    return this.organizations.updateMemberRole(id, memberId, body.role);
  }

  @Delete(":id/members/:memberId")
  removeMember(@Param("id") id: string, @Param("memberId") memberId: string) {
    return this.organizations.removeMember(id, memberId);
  }
}

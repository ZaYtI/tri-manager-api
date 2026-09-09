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

import { ClubAdminService } from "./club-admin.service";
import {
  CreateClubDto,
  CreateRoleDto,
  InviteMemberDto,
  MemberRoleDto,
  UpdateClubDto,
  UpdateRoleDto,
} from "./dto/club.dto";

@Controller("clubs")
@UseGuards(AuthGuard)
@Roles(["admin"])
export class ClubAdminController {
  constructor(private readonly clubs: ClubAdminService) {}

  @Get()
  findAll(@Paginate() query: PaginateQuery) {
    return this.clubs.findAll(query);
  }

  @Post()
  create(@Body() body: CreateClubDto) {
    return this.clubs.create(body.name, body.slug, body.ownerId);
  }

  @Get("permissions")
  getPermissions() {
    return this.clubs.getStatements();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.clubs.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: UpdateClubDto) {
    return this.clubs.update(id, body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.clubs.remove(id);
  }

  @Get(":id/roles")
  listRoles(@Param("id") id: string) {
    return this.clubs.listRoles(id);
  }

  @Post(":id/roles")
  createRole(@Param("id") id: string, @Body() body: CreateRoleDto) {
    return this.clubs.createRole(id, body);
  }

  @Patch(":id/roles/:roleId")
  updateRole(
    @Param("id") id: string,
    @Param("roleId") roleId: string,
    @Body() body: UpdateRoleDto,
  ) {
    return this.clubs.updateRole(id, roleId, body);
  }

  @Delete(":id/roles/:roleId")
  deleteRole(@Param("id") id: string, @Param("roleId") roleId: string) {
    return this.clubs.deleteRole(id, roleId);
  }

  @Get(":id/invitations")
  listInvitations(@Param("id") id: string) {
    return this.clubs.listInvitations(id);
  }

  @Post(":id/members/invite")
  invite(
    @Param("id") id: string,
    @Body() body: InviteMemberDto,
    @Session() session: UserSession,
  ) {
    return this.clubs.inviteMember(id, body.email, body.role, session.user.id);
  }

  @Delete(":id/invitations/:invitationId")
  cancelInvitation(
    @Param("id") id: string,
    @Param("invitationId") invitationId: string,
  ) {
    return this.clubs.cancelInvitation(id, invitationId);
  }

  @Patch(":id/members/:memberId")
  updateMemberRole(
    @Param("id") id: string,
    @Param("memberId") memberId: string,
    @Body() body: MemberRoleDto,
  ) {
    return this.clubs.updateMemberRole(id, memberId, body.role);
  }

  @Delete(":id/members/:memberId")
  removeMember(@Param("id") id: string, @Param("memberId") memberId: string) {
    return this.clubs.removeMember(id, memberId);
  }
}

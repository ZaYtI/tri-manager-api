import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { paginate, Paginated, PaginateQuery } from "nestjs-paginate";

import { auth } from "~/auth/utils/auth";
import {
  ORG_CREATOR_ROLE,
  ORG_DEFAULT_MEMBER_ROLE,
} from "~/organization/role/config/access-control";
import type { UserSession } from "@thallesp/nestjs-better-auth";

import { RoleService } from "~/organization/role/role.service";
import { AuditService } from "~/audit/audit.service";
import { AUDIT_ACTIONS } from "~/audit/audit.constants";
import { AuditActor } from "~/audit/audit.types";
import { OrganizationEntity } from "../entities/organization.entity";
import { MemberEntity } from "./entities/member.entity";
import { MemberRole } from "./dto/member.dto";
import { MEMBER_LIST_COLUMNS, MEMBER_SELECT } from "./member.constants";
import { OrgViewer } from "./member.types";

const APP_ADMIN_ROLE = "admin";

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(MemberEntity)
    private readonly members: Repository<MemberEntity>,
    @InjectRepository(OrganizationEntity)
    private readonly organizations: Repository<OrganizationEntity>,
    private readonly roles: RoleService,
    private readonly audit: AuditService,
  ) {}

  async getViewer(orgId: string, session: UserSession): Promise<OrgViewer> {
    const userId = session.user?.id ?? null;
    const appRole = session.user?.role;
    const isAppAdmin = Array.isArray(appRole)
      ? appRole.includes(APP_ADMIN_ROLE)
      : appRole === APP_ADMIN_ROLE;
    const impersonatedBy = (
      session.session as { impersonatedBy?: string | null }
    ).impersonatedBy;

    const member = userId
      ? await this.members.findOneBy({ organizationId: orgId, userId })
      : null;

    return {
      isAppAdmin,
      isImpersonating: Boolean(impersonatedBy),
      role: member?.role ?? null,
      permissions: member
        ? await this.roles.resolvePermission(orgId, member.role)
        : {},
    };
  }

  async findAll(
    orgId: string,
    query: PaginateQuery,
  ): Promise<Paginated<MemberEntity>> {
    await this.getOrgOrFail(orgId);

    const qb = this.members
      .createQueryBuilder("member")
      .where("member.organizationId = :orgId", { orgId });

    return paginate(query, qb, {
      relations: ["user"],
      select: MEMBER_LIST_COLUMNS,
      sortableColumns: ["createdAt", "role", "user.name", "user.email"],
      searchableColumns: ["user.name", "user.email", "role"],
      filterableColumns: { role: true, "user.banned": true },
      defaultSortBy: [["createdAt", "ASC"]],
    });
  }

  async findOne(orgId: string, memberId: string) {
    const member = await this.members.findOne({
      where: { id: memberId, organizationId: orgId },
      relations: { user: true },
      select: MEMBER_SELECT,
    });
    if (!member) throw new NotFoundException("Membre introuvable");
    return member;
  }

  async add(
    orgId: string,
    userId: string,
    role: MemberRole = ORG_DEFAULT_MEMBER_ROLE,
    actor?: AuditActor,
  ) {
    await this.getOrgOrFail(orgId);

    const existing = await this.members.findOneBy({
      organizationId: orgId,
      userId,
    });
    if (existing)
      throw new BadRequestException("Déjà membre de cette organisation");

    const created = (await auth.api.addMember({
      body: { userId, organizationId: orgId, role },
    })) as { id: string } | null;
    if (!created) throw new BadRequestException("Échec de l'ajout du membre");

    const member = await this.findOne(orgId, created.id);
    await this.audit.record({
      action: AUDIT_ACTIONS.MEMBER_ADDED,
      actor,
      targetType: "member",
      targetId: created.id,
      targetLabel: member.user?.email ?? userId,
      organizationId: orgId,
      metadata: { role },
    });
    return member;
  }

  async updateRole(
    orgId: string,
    memberId: string,
    role: MemberRole,
    actor?: AuditActor,
  ) {
    const member = await this.getMemberOrFail(orgId, memberId);
    const previousRole = member.role;

    if (member.role === ORG_CREATOR_ROLE && role !== ORG_CREATOR_ROLE) {
      await this.assertNotLastCreator(orgId);
    }

    member.role = role;
    await this.members.save(member);

    await this.audit.record({
      action: AUDIT_ACTIONS.MEMBER_ROLE_CHANGED,
      actor,
      targetType: "member",
      targetId: memberId,
      targetLabel: member.userId,
      organizationId: orgId,
      metadata: { from: previousRole, to: role },
    });

    return this.findOne(orgId, memberId);
  }

  async remove(orgId: string, memberId: string, actor?: AuditActor) {
    const member = await this.getMemberOrFail(orgId, memberId);
    if (member.role === ORG_CREATOR_ROLE)
      await this.assertNotLastCreator(orgId);

    await this.members.delete({ id: memberId });

    await this.audit.record({
      action: AUDIT_ACTIONS.MEMBER_REMOVED,
      actor,
      targetType: "member",
      targetId: memberId,
      targetLabel: member.userId,
      organizationId: orgId,
      metadata: { role: member.role },
    });

    return { success: true };
  }

  private async getOrgOrFail(id: string) {
    const org = await this.organizations.findOneBy({ id });
    if (!org) throw new NotFoundException("Organisation introuvable");
    return org;
  }

  private async getMemberOrFail(orgId: string, memberId: string) {
    const member = await this.members.findOneBy({
      id: memberId,
      organizationId: orgId,
    });
    if (!member) throw new NotFoundException("Membre introuvable");
    return member;
  }

  private async assertNotLastCreator(orgId: string) {
    const creators = await this.members.countBy({
      organizationId: orgId,
      role: ORG_CREATOR_ROLE,
    });
    if (creators <= 1) {
      throw new BadRequestException(
        "Impossible de retirer le dernier créateur",
      );
    }
  }
}

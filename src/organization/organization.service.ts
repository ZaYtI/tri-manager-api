import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { randomUUID } from "crypto";
import { paginate, Paginated, PaginateQuery } from "nestjs-paginate";

import { auth } from "~/auth/utils/auth";
import { MailService } from "~/mail/mail.service";
import { User } from "~/user/entities/user.entity";
import { OrganizationEntity } from "./entities/organization.entity";
import { MemberEntity } from "./entities/member.entity";
import { OrganizationRoleEntity } from "./entities/organization-role.entity";
import { InvitationEntity } from "./entities/invitation.entity";
import {
  ORG_PERMISSION_STATEMENTS,
  ORG_ROLES_PUBLIC,
  OrgPermissions,
  OrgRolePublic,
  SYSTEM_ROLE_NAMES,
} from "./config/roles.config";
import {
  CreateRoleDto,
  UpdateOrganizationDto,
  UpdateRoleDto,
} from "./dto/organization.dto";

export type OrganizationDetail = OrganizationEntity & {
  roles: OrgRolePublic[];
};

const INVITATION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function slugifyRole(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/** Ne conserve que les couples ressource/action présents dans le catalogue. */
function sanitizePermissions(input: unknown): OrgPermissions {
  const catalogue = ORG_PERMISSION_STATEMENTS as Record<
    string,
    readonly string[]
  >;
  const clean: OrgPermissions = {};

  for (const [resource, actions] of Object.entries(
    (input as Record<string, unknown>) ?? {},
  )) {
    const allowed = catalogue[resource];
    if (!allowed || !Array.isArray(actions)) continue;
    const kept = actions.filter(
      (action): action is string =>
        typeof action === "string" && allowed.includes(action),
    );
    if (kept.length) clean[resource as keyof OrgPermissions] = kept;
  }
  return clean;
}

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly organizations: Repository<OrganizationEntity>,
    @InjectRepository(MemberEntity)
    private readonly members: Repository<MemberEntity>,
    @InjectRepository(OrganizationRoleEntity)
    private readonly customRoles: Repository<OrganizationRoleEntity>,
    @InjectRepository(InvitationEntity)
    private readonly invitations: Repository<InvitationEntity>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly mail: MailService,
  ) {}

  /* ── Organisation ─────────────────────────────────────────── */

  findAll(query: PaginateQuery): Promise<Paginated<OrganizationEntity>> {
    return paginate(query, this.organizations, {
      select: ["id", "name", "slug"],
      sortableColumns: ["name", "slug"],
      filterableColumns: { name: true, slug: true },
      defaultSortBy: [["name", "ASC"]],
    });
  }

  getStatements() {
    return ORG_PERMISSION_STATEMENTS;
  }

  async findOne(id: string): Promise<OrganizationDetail> {
    const organization = await this.organizations.findOneOrFail({
      where: { id },
      relations: ["members", "members.user"],
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        members: {
          id: true,
          role: true,
          createdAt: true,
          user: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            emailVerified: true,
            banned: true,
          },
        },
      },
    });
    return { ...organization, roles: await this.listRoles(id) };
  }

  async create(name: string, slug: string, ownerId: string) {
    try {
      return await auth.api.createOrganization({
        body: { name, slug, userId: ownerId },
      });
    } catch (error) {
      console.error("Erreur création organisation:", error);
      throw error;
    }
  }

  async update(id: string, data: UpdateOrganizationDto) {
    const organization = await this.getOrgOrFail(id);

    if (data.slug && data.slug !== organization.slug) {
      const taken = await this.organizations.findOneBy({ slug: data.slug });
      if (taken) throw new BadRequestException("Ce slug est déjà utilisé");
      organization.slug = data.slug;
    }
    if (data.name) organization.name = data.name;

    await this.organizations.save(organization);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.getOrgOrFail(id);
    await this.organizations.delete({ id });
    return { success: true };
  }

  /* ── Membres ──────────────────────────────────────────────── */

  async updateMemberRole(orgId: string, memberId: string, role: string) {
    const member = await this.getMemberOrFail(orgId, memberId);
    await this.assertRoleExists(orgId, role);

    member.role = role;
    await this.members.save(member);
    return this.findOne(orgId);
  }

  async removeMember(orgId: string, memberId: string) {
    const member = await this.getMemberOrFail(orgId, memberId);

    if (member.role === "owner") {
      const owners = await this.members.countBy({
        organizationId: orgId,
        role: "owner",
      });
      if (owners <= 1) {
        throw new BadRequestException(
          "Impossible de retirer le dernier propriétaire",
        );
      }
    }

    await this.members.delete({ id: memberId });
    return this.findOne(orgId);
  }

  async inviteMember(
    orgId: string,
    email: string,
    role: string,
    inviterId: string,
  ) {
    const organization = await this.getOrgOrFail(orgId);
    await this.assertRoleExists(orgId, role);

    const alreadyMember = await this.members
      .createQueryBuilder("member")
      .innerJoin("member.user", "user")
      .where("member.organizationId = :orgId", { orgId })
      .andWhere("LOWER(user.email) = LOWER(:email)", { email })
      .getCount();
    if (alreadyMember > 0) throw new BadRequestException("Déjà membre");

    const inviter = await this.users.findOne({
      where: { id: inviterId },
      select: ["name", "email"],
    });

    const invitation = await this.invitations.save(
      this.invitations.create({
        id: randomUUID(),
        organizationId: orgId,
        email,
        role,
        status: "pending",
        expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
        inviterId,
      }),
    );

    const frontOrigin = process.env.FRONT_ORIGIN ?? "http://localhost:3000";
    await this.mail.sendOrganizationInvitation({
      email,
      invitedByName: inviter?.name ?? "Un administrateur",
      invitedByEmail: inviter?.email ?? "",
      organizationName: organization.name,
      inviteLink: `${frontOrigin}/accept-invitation/${invitation.id}`,
    });

    return invitation;
  }

  listInvitations(orgId: string) {
    return this.invitations.find({
      where: { organizationId: orgId, status: "pending" },
      order: { createdAt: "DESC" },
    });
  }

  async cancelInvitation(orgId: string, invitationId: string) {
    await this.invitations.update(
      { id: invitationId, organizationId: orgId },
      { status: "canceled" },
    );
    return { success: true };
  }

  /* ── Rôles personnalisés ──────────────────────────────────── */

  async listRoles(orgId: string): Promise<OrgRolePublic[]> {
    const custom = await this.customRoles.findBy({ organizationId: orgId });
    return [
      ...ORG_ROLES_PUBLIC,
      ...custom.map<OrgRolePublic>((entity) => ({
        role: entity.role,
        label: entity.role.charAt(0).toUpperCase() + entity.role.slice(1),
        color: null,
        icon: null,
        permissions: parsePermission(entity.permission),
        system: false,
      })),
    ];
  }

  async createRole(orgId: string, { role, permissions }: CreateRoleDto) {
    await this.getOrgOrFail(orgId);

    const name = slugifyRole(role);
    if (!name) throw new BadRequestException("Nom de rôle invalide");
    if (SYSTEM_ROLE_NAMES.includes(name)) {
      throw new BadRequestException("Ce nom est réservé");
    }
    if (
      await this.customRoles.findOneBy({ organizationId: orgId, role: name })
    ) {
      throw new BadRequestException("Ce rôle existe déjà");
    }

    await this.customRoles.save(
      this.customRoles.create({
        id: randomUUID(),
        organizationId: orgId,
        role: name,
        permission: JSON.stringify(sanitizePermissions(permissions)),
        createdAt: new Date(),
      }),
    );
    return this.listRoles(orgId);
  }

  async updateRole(
    orgId: string,
    roleId: string,
    { permissions }: UpdateRoleDto,
  ) {
    const entity = await this.getCustomRoleOrFail(orgId, roleId);
    entity.permission = JSON.stringify(sanitizePermissions(permissions));
    entity.updatedAt = new Date();
    await this.customRoles.save(entity);
    return this.listRoles(orgId);
  }

  async deleteRole(orgId: string, roleId: string) {
    const entity = await this.getCustomRoleOrFail(orgId, roleId);

    const inUse = await this.members.countBy({
      organizationId: orgId,
      role: entity.role,
    });
    if (inUse > 0) {
      throw new BadRequestException(
        `${inUse} membre(s) utilisent encore ce rôle`,
      );
    }

    await this.customRoles.delete({ id: roleId });
    return this.listRoles(orgId);
  }

  /* ── Helpers ──────────────────────────────────────────────── */

  private async getOrgOrFail(id: string) {
    const organization = await this.organizations.findOneBy({ id });
    if (!organization) throw new NotFoundException("Organisation introuvable");
    return organization;
  }

  private async getMemberOrFail(orgId: string, memberId: string) {
    const member = await this.members.findOneBy({
      id: memberId,
      organizationId: orgId,
    });
    if (!member) throw new NotFoundException("Membre introuvable");
    return member;
  }

  private async getCustomRoleOrFail(orgId: string, roleId: string) {
    const entity = await this.customRoles.findOneBy({
      id: roleId,
      organizationId: orgId,
    });
    if (!entity) throw new NotFoundException("Rôle introuvable");
    return entity;
  }

  private async assertRoleExists(orgId: string, role: string) {
    if (SYSTEM_ROLE_NAMES.includes(role)) return;
    const custom = await this.customRoles.findOneBy({
      organizationId: orgId,
      role,
    });
    if (!custom) throw new BadRequestException("Rôle inconnu");
  }
}

function parsePermission(raw: string): OrgPermissions {
  try {
    return sanitizePermissions(JSON.parse(raw));
  } catch {
    return {};
  }
}

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
import { ClubEntity } from "./entities/club.entity";
import { MemberEntity } from "./entities/member.entity";
import { ClubRoleEntity } from "./entities/club-role.entity";
import { InvitationEntity } from "./entities/invitation.entity";
import {
  CLUB_PERMISSION_STATEMENTS,
  CLUB_ROLES,
  CLUB_ROLES_PUBLIC,
  ClubPermissions,
  ClubRolePublic,
  SYSTEM_ROLE_NAMES,
} from "./config/roles.config";
import { CreateRoleDto, UpdateClubDto, UpdateRoleDto } from "./dto/club.dto";

export type ClubDetail = ClubEntity & {
  roles: ClubRolePublic[];
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
function sanitizePermissions(input: unknown): ClubPermissions {
  const catalogue = CLUB_PERMISSION_STATEMENTS as Record<
    string,
    readonly string[]
  >;
  const clean: ClubPermissions = {};

  for (const [resource, actions] of Object.entries(
    (input as Record<string, unknown>) ?? {},
  )) {
    const allowed = catalogue[resource];
    if (!allowed || !Array.isArray(actions)) continue;
    const kept = actions.filter(
      (action): action is string =>
        typeof action === "string" && allowed.includes(action),
    );
    if (kept.length) clean[resource as keyof ClubPermissions] = kept;
  }
  return clean;
}

@Injectable()
export class ClubAdminService {
  constructor(
    @InjectRepository(ClubEntity)
    private readonly clubs: Repository<ClubEntity>,
    @InjectRepository(MemberEntity)
    private readonly members: Repository<MemberEntity>,
    @InjectRepository(ClubRoleEntity)
    private readonly customRoles: Repository<ClubRoleEntity>,
    @InjectRepository(InvitationEntity)
    private readonly invitations: Repository<InvitationEntity>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly mail: MailService,
  ) {}

  /* ── club ─────────────────────────────────────────── */

  findAll(query: PaginateQuery): Promise<Paginated<ClubEntity>> {
    return paginate(query, this.clubs, {
      select: ["id", "name", "slug"],
      sortableColumns: ["name", "slug"],
      filterableColumns: { name: true, slug: true },
      defaultSortBy: [["name", "ASC"]],
    });
  }

  getStatements() {
    return CLUB_PERMISSION_STATEMENTS;
  }

  async resolveRolePermissions(
    clubId: string,
    role: string,
  ): Promise<ClubPermissions> {
    if (Object.prototype.hasOwnProperty.call(CLUB_ROLES, role)) {
      return CLUB_ROLES[role].permissions;
    }
    const custom = await this.customRoles.findOneBy({
      organizationId: clubId,
      role,
    });
    return custom ? parsePermission(custom.permission) : {};
  }

  async findOne(id: string): Promise<ClubDetail> {
    const club = await this.clubs.findOneOrFail({
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
    return { ...club, roles: await this.listRoles(id) };
  }

  async create(name: string, slug: string, ownerId: string) {
    try {
      return await auth.api.createOrganization({
        body: { name, slug, userId: ownerId },
      });
    } catch (error) {
      console.error("Erreur création club:", error);
      throw error;
    }
  }

  async update(id: string, data: UpdateClubDto) {
    const club = await this.getClubOrFail(id);

    if (data.slug && data.slug !== club.slug) {
      const taken = await this.clubs.findOneBy({ slug: data.slug });
      if (taken) throw new BadRequestException("Ce slug est déjà utilisé");
      club.slug = data.slug;
    }
    if (data.name) club.name = data.name;

    await this.clubs.save(club);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.getClubOrFail(id);
    await this.clubs.delete({ id });
    return { success: true };
  }

  /* ── Membres ──────────────────────────────────────────────── */

  async updateMemberRole(clubId: string, memberId: string, role: string) {
    const member = await this.getMemberOrFail(clubId, memberId);
    await this.assertRoleExists(clubId, role);

    member.role = role;
    await this.members.save(member);
    return this.findOne(clubId);
  }

  async removeMember(clubId: string, memberId: string) {
    const member = await this.getMemberOrFail(clubId, memberId);

    if (member.role === "owner") {
      const owners = await this.members.countBy({
        organizationId: clubId,
        role: "owner",
      });
      if (owners <= 1) {
        throw new BadRequestException(
          "Impossible de retirer le dernier propriétaire",
        );
      }
    }

    await this.members.delete({ id: memberId });
    return this.findOne(clubId);
  }

  async inviteMember(
    clubId: string,
    email: string,
    role: string,
    inviterId: string,
  ) {
    const club = await this.getClubOrFail(clubId);
    await this.assertRoleExists(clubId, role);

    const alreadyMember = await this.members
      .createQueryBuilder("member")
      .innerJoin("member.user", "user")
      .where("member.organizationId = :clubId", { clubId })
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
        organizationId: clubId,
        email,
        role,
        status: "pending",
        expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
        inviterId,
      }),
    );

    const frontOrigin = process.env.FRONT_ORIGIN ?? "http://localhost:3000";
    await this.mail.sendClubInvitation({
      email,
      invitedByName: inviter?.name ?? "Un administrateur",
      invitedByEmail: inviter?.email ?? "",
      clubName: club.name,
      inviteLink: `${frontOrigin}/accept-invitation/${invitation.id}`,
    });

    return invitation;
  }

  listInvitations(clubId: string) {
    return this.invitations.find({
      where: { organizationId: clubId, status: "pending" },
      order: { createdAt: "DESC" },
    });
  }

  async cancelInvitation(clubId: string, invitationId: string) {
    await this.invitations.update(
      { id: invitationId, organizationId: clubId },
      { status: "canceled" },
    );
    return { success: true };
  }

  /* ── Rôles personnalisés ──────────────────────────────────── */

  async listRoles(clubId: string): Promise<ClubRolePublic[]> {
    const custom = await this.customRoles.findBy({ organizationId: clubId });
    return [
      ...CLUB_ROLES_PUBLIC,
      ...custom.map<ClubRolePublic>((entity) => ({
        role: entity.role,
        label: entity.role.charAt(0).toUpperCase() + entity.role.slice(1),
        color: null,
        icon: null,
        permissions: parsePermission(entity.permission),
        system: false,
      })),
    ];
  }

  async createRole(clubId: string, { role, permissions }: CreateRoleDto) {
    await this.getClubOrFail(clubId);

    const name = slugifyRole(role);
    if (!name) throw new BadRequestException("Nom de rôle invalide");
    if (SYSTEM_ROLE_NAMES.includes(name)) {
      throw new BadRequestException("Ce nom est réservé");
    }
    if (
      await this.customRoles.findOneBy({ organizationId: clubId, role: name })
    ) {
      throw new BadRequestException("Ce rôle existe déjà");
    }

    await this.customRoles.save(
      this.customRoles.create({
        id: randomUUID(),
        organizationId: clubId,
        role: name,
        permission: JSON.stringify(sanitizePermissions(permissions)),
        createdAt: new Date(),
      }),
    );
    return this.listRoles(clubId);
  }

  async updateRole(
    clubId: string,
    roleId: string,
    { permissions }: UpdateRoleDto,
  ) {
    const entity = await this.getCustomRoleOrFail(clubId, roleId);
    entity.permission = JSON.stringify(sanitizePermissions(permissions));
    entity.updatedAt = new Date();
    await this.customRoles.save(entity);
    return this.listRoles(clubId);
  }

  async deleteRole(clubId: string, roleId: string) {
    const entity = await this.getCustomRoleOrFail(clubId, roleId);

    const inUse = await this.members.countBy({
      organizationId: clubId,
      role: entity.role,
    });
    if (inUse > 0) {
      throw new BadRequestException(
        `${inUse} membre(s) utilisent encore ce rôle`,
      );
    }

    await this.customRoles.delete({ id: roleId });
    return this.listRoles(clubId);
  }

  /* ── Helpers ──────────────────────────────────────────────── */

  private async getClubOrFail(id: string) {
    const club = await this.clubs.findOneBy({ id });
    if (!club) throw new NotFoundException("club introuvable");
    return club;
  }

  private async getMemberOrFail(clubId: string, memberId: string) {
    const member = await this.members.findOneBy({
      id: memberId,
      organizationId: clubId,
    });
    if (!member) throw new NotFoundException("Membre introuvable");
    return member;
  }

  private async getCustomRoleOrFail(clubId: string, roleId: string) {
    const entity = await this.customRoles.findOneBy({
      id: roleId,
      organizationId: clubId,
    });
    if (!entity) throw new NotFoundException("Rôle introuvable");
    return entity;
  }

  private async assertRoleExists(clubId: string, role: string) {
    if (SYSTEM_ROLE_NAMES.includes(role)) return;
    const custom = await this.customRoles.findOneBy({
      organizationId: clubId,
      role,
    });
    if (!custom) throw new BadRequestException("Rôle inconnu");
  }
}

function parsePermission(raw: string): ClubPermissions {
  try {
    return sanitizePermissions(JSON.parse(raw));
  } catch {
    return {};
  }
}

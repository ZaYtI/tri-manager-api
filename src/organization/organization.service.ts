import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { paginate, Paginated, PaginateQuery } from "nestjs-paginate";

import { auth } from "~/auth/utils/auth";
import { AuditService } from "~/audit/audit.service";
import { AUDIT_ACTIONS } from "~/audit/audit.constants";
import { AuditActor } from "~/audit/audit.types";
import { OrganizationEntity } from "./entities/organization.entity";
import { MemberEntity } from "./member/entities/member.entity";
import { UpdateOrganizationDto } from "./dto/organization.dto";
import { OrganizationListItem } from "./organization.types";

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly organizations: Repository<OrganizationEntity>,
    @InjectRepository(MemberEntity)
    private readonly members: Repository<MemberEntity>,
    private readonly audit: AuditService,
  ) {}

  async findAll(
    query: PaginateQuery,
  ): Promise<Paginated<OrganizationListItem>> {
    const page = await paginate(query, this.organizations, {
      select: ["id", "name", "slug", "active", "createdAt"],
      sortableColumns: ["name", "slug", "createdAt"],
      searchableColumns: ["name", "slug"],
      filterableColumns: { name: true, slug: true, active: true },
      defaultSortBy: [["name", "ASC"]],
    });

    const counts = await this.countMembers(page.data.map((org) => org.id));

    return {
      ...page,
      data: page.data.map((org) => ({
        ...org,
        membersCount: counts.get(org.id) ?? 0,
      })),
    };
  }

  findOne(id: string): Promise<OrganizationEntity> {
    return this.getOrgOrFail(id);
  }

  async create(
    name: string,
    slug: string,
    ownerId: string,
    actor?: AuditActor,
  ) {
    let created: { id?: string };
    try {
      created = (await auth.api.createOrganization({
        body: { name, slug, userId: ownerId },
      })) as { id?: string };
    } catch (error) {
      console.error("Erreur création organisation:", error);
      throw error;
    }

    await this.audit.record({
      action: AUDIT_ACTIONS.ORGANIZATION_CREATED,
      actor,
      targetType: "organization",
      targetId: created.id ?? null,
      targetLabel: name,
      organizationId: created.id ?? null,
      metadata: { slug, ownerId },
    });

    return created;
  }

  async update(id: string, data: UpdateOrganizationDto, actor?: AuditActor) {
    const organization = await this.getOrgOrFail(id);
    const before = { name: organization.name, slug: organization.slug };

    if (data.slug && data.slug !== organization.slug) {
      const taken = await this.organizations.findOneBy({ slug: data.slug });
      if (taken) throw new BadRequestException("Ce slug est déjà utilisé");
      organization.slug = data.slug;
    }
    if (data.name) organization.name = data.name;

    const activeChanged =
      typeof data.active === "boolean" && data.active !== organization.active;
    if (typeof data.active === "boolean") organization.active = data.active;

    await this.organizations.save(organization);

    if (activeChanged) {
      await this.audit.record({
        action: data.active
          ? AUDIT_ACTIONS.ORGANIZATION_REACTIVATED
          : AUDIT_ACTIONS.ORGANIZATION_DEACTIVATED,
        actor,
        targetType: "organization",
        targetId: id,
        targetLabel: organization.name,
        organizationId: id,
      });
    } else {
      await this.audit.record({
        action: AUDIT_ACTIONS.ORGANIZATION_UPDATED,
        actor,
        targetType: "organization",
        targetId: id,
        targetLabel: organization.name,
        organizationId: id,
        metadata: { from: before, to: { name: data.name, slug: data.slug } },
      });
    }

    return this.findOne(id);
  }

  async remove(id: string, actor?: AuditActor) {
    const organization = await this.getOrgOrFail(id);
    await this.organizations.delete({ id });

    await this.audit.record({
      action: AUDIT_ACTIONS.ORGANIZATION_DELETED,
      actor,
      targetType: "organization",
      targetId: id,
      targetLabel: organization.name,
      organizationId: id,
    });

    return { success: true };
  }

  private async countMembers(ids: string[]): Promise<Map<string, number>> {
    if (ids.length === 0) return new Map();

    const rows = await this.members
      .createQueryBuilder("member")
      .select("member.organizationId", "organizationId")
      .addSelect("COUNT(*)", "count")
      .where("member.organizationId IN (:...ids)", { ids })
      .groupBy("member.organizationId")
      .getRawMany<{ organizationId: string; count: string }>();

    return new Map(rows.map((row) => [row.organizationId, Number(row.count)]));
  }

  private async getOrgOrFail(id: string) {
    const organization = await this.organizations.findOneBy({ id });
    if (!organization) throw new NotFoundException("Organisation introuvable");
    return organization;
  }
}

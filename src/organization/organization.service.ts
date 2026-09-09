import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { paginate, Paginated, PaginateQuery } from "nestjs-paginate";

import { auth } from "~/auth/utils/auth";
import { OrganizationEntity } from "./entities/organization.entity";
import { UpdateOrganizationDto } from "./dto/organization.dto";

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly organizations: Repository<OrganizationEntity>,
  ) {}

  findAll(query: PaginateQuery): Promise<Paginated<OrganizationEntity>> {
    return paginate(query, this.organizations, {
      select: ["id", "name", "slug"],
      sortableColumns: ["name", "slug"],
      filterableColumns: { name: true, slug: true },
      defaultSortBy: [["name", "ASC"]],
    });
  }

  findOne(id: string): Promise<OrganizationEntity> {
    return this.getOrgOrFail(id);
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

  private async getOrgOrFail(id: string) {
    const organization = await this.organizations.findOneBy({ id });
    if (!organization) throw new NotFoundException("Organisation introuvable");
    return organization;
  }
}

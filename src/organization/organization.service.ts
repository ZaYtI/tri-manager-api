import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OrganizationEntity } from "./entities/organization.entity";
import { MemberEntity } from "./entities/member.entity";
import { auth } from "~/auth/utils/auth";
import { paginate, Paginated, PaginateQuery } from "nestjs-paginate";

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly orgRepository: Repository<OrganizationEntity>,
    @InjectRepository(MemberEntity)
    private readonly memberRepository: Repository<MemberEntity>,
  ) {}

  async findAll(query: PaginateQuery): Promise<Paginated<OrganizationEntity>> {
    return paginate(query, this.orgRepository, {
      select: ["id", "name", "slug"],
      sortableColumns: ["name", "slug"],
      filterableColumns: {
        name: true,
        slug: true,
      },
      defaultSortBy: [["name", "ASC"]],
    });
  }

  async findOne(id: string): Promise<OrganizationEntity> {
    return this.orgRepository.findOneByOrFail({ id });
  }

  async findMembers(id: string): Promise<MemberEntity[]> {
    return this.memberRepository.find({
      where: { organizationId: id },
      relations: ["user"],
    });
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
}

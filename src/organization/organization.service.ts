import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OrganizationEntity } from "./entities/organization.entity";
import { auth } from "~/auth/utils/auth";

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly orgRepository: Repository<OrganizationEntity>,
  ) {}

  async findAll(): Promise<OrganizationEntity[]> {
    return this.orgRepository
      .createQueryBuilder("org")
      .loadRelationCountAndMap("org.memberCount", "org.members")
      .getMany();
  }

  async create(name: string, slug: string, ownerId: string) {
    try {
      const org = await auth.api.createOrganization({
        body: {
          name,
          slug,
          userId: ownerId,
        },
      });

      return org;
    } catch (error) {
      console.error("Erreur création organisation:", error);
      throw error;
    }
  }
}

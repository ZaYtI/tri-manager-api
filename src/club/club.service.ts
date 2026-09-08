import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { OrganizationEntity } from "~/organization/entities/organization.entity";
import { MemberEntity } from "~/organization/entities/member.entity";
import { OrganizationService } from "~/organization/organization.service";
import { OrgPermissions } from "~/organization/config/roles.config";

export interface ClubSpace {
  organization: {
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
  };
  member: {
    id: string;
    role: string;
    permissions: OrgPermissions;
  };
}

@Injectable()
export class ClubService {
  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly organizations: Repository<OrganizationEntity>,
    @InjectRepository(MemberEntity)
    private readonly members: Repository<MemberEntity>,
    private readonly organizationService: OrganizationService,
  ) {}

  async getSpaceForCaller(
    userId: string,
    activeOrganizationId?: string,
  ): Promise<ClubSpace> {
    if (!activeOrganizationId) {
      throw new NotFoundException("Aucune organisation active");
    }

    const member = await this.members.findOneBy({
      userId,
      organizationId: activeOrganizationId,
    });
    if (!member) {
      throw new NotFoundException(
        "Vous n'êtes pas membre de cette organisation",
      );
    }

    const organization = await this.organizations.findOneBy({
      id: activeOrganizationId,
    });
    if (!organization) {
      throw new NotFoundException("Organisation introuvable");
    }

    const permissions = await this.organizationService.resolveRolePermissions(
      activeOrganizationId,
      member.role,
    );

    return {
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        createdAt: organization.createdAt,
      },
      member: {
        id: member.id,
        role: member.role,
        permissions,
      },
    };
  }
}

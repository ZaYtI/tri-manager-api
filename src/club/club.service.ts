import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { ClubEntity } from "~/club/entities/club.entity";
import { MemberEntity } from "~/club/entities/member.entity";
import { ClubAdminService } from "~/club/club-admin.service";
import { ClubPermissions } from "~/club/config/roles.config";

export interface ClubSpace {
  club: {
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
  };
  member: {
    id: string;
    role: string;
    permissions: ClubPermissions;
  };
}

@Injectable()
export class ClubService {
  constructor(
    @InjectRepository(ClubEntity)
    private readonly clubs: Repository<ClubEntity>,
    @InjectRepository(MemberEntity)
    private readonly members: Repository<MemberEntity>,
    private readonly clubAdmin: ClubAdminService,
  ) {}

  async getSpaceForCaller(
    userId: string,
    activeClubId?: string,
  ): Promise<ClubSpace> {
    if (!activeClubId) {
      throw new NotFoundException("Aucun club actif");
    }

    const member = await this.members.findOneBy({
      userId,
      organizationId: activeClubId,
    });
    if (!member) {
      throw new NotFoundException("Vous n'êtes pas membre de ce club");
    }

    const club = await this.clubs.findOneBy({ id: activeClubId });
    if (!club) {
      throw new NotFoundException("Club introuvable");
    }

    const permissions = await this.clubAdmin.resolveRolePermissions(
      activeClubId,
      member.role,
    );

    return {
      club: {
        id: club.id,
        name: club.name,
        slug: club.slug,
        createdAt: club.createdAt,
      },
      member: {
        id: member.id,
        role: member.role,
        permissions,
      },
    };
  }
}

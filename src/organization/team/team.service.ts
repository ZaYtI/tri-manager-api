import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { paginate, Paginated, PaginateQuery } from "nestjs-paginate";

import { TeamEntity } from "./entities/team.entity";
import { TeamMemberEntity } from "./entities/team-member.entity";

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(TeamEntity)
    private readonly teams: Repository<TeamEntity>,
    @InjectRepository(TeamMemberEntity)
    private readonly teamMembers: Repository<TeamMemberEntity>,
  ) {}

  findAll(orgId: string, query: PaginateQuery): Promise<Paginated<TeamEntity>> {
    const qb = this.teams
      .createQueryBuilder("team")
      .where("team.organizationId = :orgId", { orgId });

    return paginate(query, qb, {
      sortableColumns: ["name", "createdAt"],
      searchableColumns: ["name"],
      defaultSortBy: [["name", "ASC"]],
    });
  }

  async listMembers(orgId: string, teamId: string) {
    const team = await this.teams.findOne({
      where: { id: teamId, organizationId: orgId },
    });
    if (!team) throw new NotFoundException("Groupe introuvable");

    return this.teamMembers.find({
      where: { teamId },
      order: { createdAt: "ASC" },
      select: {
        id: true,
        teamId: true,
        userId: true,
        createdAt: true,
        user: { id: true, name: true, email: true, image: true },
      },
      relations: { user: true },
    });
  }

  /** Groupes de chaque utilisateur donné, dans une seule organisation. */
  async findGroupsByUserIds(
    orgId: string,
    userIds: string[],
  ): Promise<Map<string, { id: string; name: string }[]>> {
    const result = new Map<string, { id: string; name: string }[]>();
    if (userIds.length === 0) return result;

    const rows = await this.teamMembers
      .createQueryBuilder("teamMember")
      .innerJoin(TeamEntity, "team", "team.id = teamMember.teamId")
      .where("team.organizationId = :orgId", { orgId })
      .andWhere("teamMember.userId IN (:...userIds)", { userIds })
      .select("teamMember.userId", "userId")
      .addSelect("team.id", "teamId")
      .addSelect("team.name", "teamName")
      .getRawMany<{ userId: string; teamId: string; teamName: string }>();

    for (const row of rows) {
      const list = result.get(row.userId) ?? [];
      list.push({ id: row.teamId, name: row.teamName });
      result.set(row.userId, list);
    }
    return result;
  }
}

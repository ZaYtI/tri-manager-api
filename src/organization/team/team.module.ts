import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { TeamEntity } from "./entities/team.entity";
import { TeamMemberEntity } from "./entities/team-member.entity";
import { TeamService } from "./team.service";
import { TeamController } from "./team.controller";

@Module({
  imports: [TypeOrmModule.forFeature([TeamEntity, TeamMemberEntity])],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}

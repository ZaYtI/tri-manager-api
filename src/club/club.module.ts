import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { OrganizationEntity } from "~/organization/entities/organization.entity";
import { MemberEntity } from "~/organization/entities/member.entity";
import { OrganizationModule } from "~/organization/organization.module";
import { ClubController } from "./club.controller";
import { ClubService } from "./club.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([OrganizationEntity, MemberEntity]),
    OrganizationModule,
  ],
  controllers: [ClubController],
  providers: [ClubService],
})
export class ClubModule {}

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrganizationEntity } from "./entities/organization.entity";
import { MemberEntity } from "./entities/member.entity";
import { OrganizationService } from "./organization.service";
import { OrganizationController } from "./organization.controller";

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationEntity, MemberEntity])],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}

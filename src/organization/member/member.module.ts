import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { RoleModule } from "../role/role.module";
import { OrganizationEntity } from "../entities/organization.entity";
import { MemberEntity } from "./entities/member.entity";
import { MemberService } from "./member.service";
import { MemberController } from "./member.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([MemberEntity, OrganizationEntity]),
    RoleModule,
  ],
  controllers: [MemberController],
  providers: [MemberService],
  exports: [MemberService],
})
export class MemberModule {}

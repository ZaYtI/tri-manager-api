import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { OrganizationEntity } from "./entities/organization.entity";
import { MemberEntity } from "./member/entities/member.entity";
import { OrganizationService } from "./organization.service";
import { OrganizationController } from "./organization.controller";
import { MemberModule } from "./member/member.module";
import { InvitationModule } from "./invitation/invitation.module";
import { RoleModule } from "./role/role.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([OrganizationEntity, MemberEntity]),
    MemberModule,
    InvitationModule,
    RoleModule,
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}

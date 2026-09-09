import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { User } from "~/user/entities/user.entity";
import { MailModule } from "~/mail/mail.module";
import { ClubEntity } from "./entities/club.entity";
import { MemberEntity } from "./entities/member.entity";
import { ClubRoleEntity } from "./entities/club-role.entity";
import { InvitationEntity } from "./entities/invitation.entity";
import { ClubController } from "./club.controller";
import { ClubService } from "./club.service";
import { ClubAdminController } from "./club-admin.controller";
import { ClubAdminService } from "./club-admin.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClubEntity,
      MemberEntity,
      ClubRoleEntity,
      InvitationEntity,
      User,
    ]),
    MailModule,
  ],
  controllers: [ClubController, ClubAdminController],
  providers: [ClubService, ClubAdminService],
  exports: [ClubAdminService],
})
export class ClubModule {}

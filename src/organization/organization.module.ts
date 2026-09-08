import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { User } from "~/user/entities/user.entity";
import { MailModule } from "~/mail/mail.module";
import { OrganizationEntity } from "./entities/organization.entity";
import { MemberEntity } from "./entities/member.entity";
import { OrganizationRoleEntity } from "./entities/organization-role.entity";
import { InvitationEntity } from "./entities/invitation.entity";
import { OrganizationService } from "./organization.service";
import { OrganizationController } from "./organization.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrganizationEntity,
      MemberEntity,
      OrganizationRoleEntity,
      InvitationEntity,
      User,
    ]),
    MailModule,
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}

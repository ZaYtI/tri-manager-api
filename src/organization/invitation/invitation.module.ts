import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { InvitationEntity } from "./entities/invitation.entity";
import { InvitationService } from "./invitation.service";
import { InvitationController } from "./invitation.controller";
import { InvitationAccessController } from "./invitation-access.controller";

@Module({
  imports: [TypeOrmModule.forFeature([InvitationEntity])],
  controllers: [InvitationController, InvitationAccessController],
  providers: [InvitationService],
  exports: [InvitationService],
})
export class InvitationModule {}

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { MemberEntity } from "~/organization/entities/member.entity";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";

@Module({
  imports: [TypeOrmModule.forFeature([User, MemberEntity])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}

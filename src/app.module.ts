import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "./database/typeorm.module";
import { ConfigModule } from "@nestjs/config";
import database from "./config/database";
import { MailModule } from "./mail/mail.module";
import { AuthModule } from "./auth/auth.module";
import { OrganizationModule } from "./organization/organization.module";
import { UserModule } from "./user/user.module";
import { ClubModule } from "./club/club.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [database] }),
    AuthModule,
    TypeOrmModule,
    MailModule,
    OrganizationModule,
    UserModule,
    ClubModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

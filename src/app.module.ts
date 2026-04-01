import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "./database/typeorm.module";
import { ConfigModule } from "@nestjs/config";
import database from "./config/database";
import { UserModule } from "./user/user.module";
import { MailModule } from "./mail/mail.module";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [database] }),
    AuthModule,
    TypeOrmModule,
    UserModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

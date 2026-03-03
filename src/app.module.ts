import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "./database/typeorm.module";
import { ConfigModule } from "@nestjs/config";
import database from "./config/database";
import { AuthModule as BetterAuthModule } from "@thallesp/nestjs-better-auth";
import { UserModule } from "./user/user.module";
import { auth } from "./utils/auth";
import { MailModule } from "./mail/mail.module";
import { AuthListenerModule } from "./auth/auth-listener.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [database] }),
    TypeOrmModule,
    BetterAuthModule.forRoot({
      auth,
      disableTrustedOriginsCors: true,
    }),
    UserModule,
    MailModule,
    AuthListenerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

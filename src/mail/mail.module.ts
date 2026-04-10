import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { join } from "path";
import { MailService } from "./mail.service";

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.getOrThrow<string>("MAIL_HOST"),
          port: config.getOrThrow<number>("MAIL_PORT"),
          secure: false,
          auth: {
            user: config.getOrThrow<string>("MAIL_USER"),
            pass: config.getOrThrow<string>("MAIL_PASSWORD"),
          },
        },
        defaults: {
          from: `"${config.get("MAIL_FROM_NAME")}" <${config.get("MAIL_FROM_ADDRESS")}>`,
        },
        template: {
          dir: join(__dirname, "templates"),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}

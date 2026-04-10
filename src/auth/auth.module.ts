import { Inject, Module } from "@nestjs/common";
import { AuthModule as BetterAuthModule } from "@thallesp/nestjs-better-auth";
import { auth } from "./utils/auth";
import {
  AUTH_EVENTS,
  authEventsProvider,
} from "./providers/auth-events.provider";
import { EventEmitter } from "stream";
import { MailModule } from "../mail/mail.module";
import { MailService } from "../mail/mail.service";

@Module({
  imports: [
    BetterAuthModule.forRoot({
      auth,
      disableTrustedOriginsCors: true,
    }),
    MailModule,
  ],
  providers: [authEventsProvider],
})
export class AuthModule {
  constructor(
    private readonly mailService: MailService,
    @Inject(AUTH_EVENTS) private readonly authEvents: EventEmitter,
  ) {}

  onModuleInit() {
    this.authEvents.on(
      "verify-email",
      (data: { email: string; name: string; url: string; token: string }) => {
        void this.mailService.sendVerificationEmail(data);
      },
    );
  }
}

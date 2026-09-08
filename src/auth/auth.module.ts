import { Inject, Module } from "@nestjs/common";
import { AuthModule as BetterAuthModule } from "@thallesp/nestjs-better-auth";
import { EventEmitter } from "stream";

import { auth } from "./utils/auth";
import {
  AUTH_EVENTS,
  authEventsProvider,
} from "./providers/auth-events.provider";
import { MailModule } from "../mail/mail.module";
import { MailService } from "../mail/mail.service";

interface AuthEmailPayload {
  email: string;
  name: string;
  url: string;
  token: string;
}

@Module({
  imports: [
    BetterAuthModule.forRoot({ auth, disableTrustedOriginsCors: true }),
    MailModule,
  ],
  providers: [authEventsProvider],
})
export class AuthModule {
  constructor(
    private readonly mail: MailService,
    @Inject(AUTH_EVENTS) private readonly authEvents: EventEmitter,
  ) {}

  onModuleInit() {
    this.authEvents.on("verify-email", (data: AuthEmailPayload) => {
      void this.mail.sendVerificationEmail(data);
    });
    this.authEvents.on("reset-password", (data: AuthEmailPayload) => {
      void this.mail.sendResetPassword(data);
    });
  }
}

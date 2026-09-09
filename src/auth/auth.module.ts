import { Inject, Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { AuthModule as BetterAuthModule } from "@thallesp/nestjs-better-auth";
import { EventEmitter } from "stream";

import { auth } from "./utils/auth";
import {
  AUTH_EVENTS,
  authEventsProvider,
} from "./providers/auth-events.provider";
import { BetterAuthExceptionFilter } from "./filters/better-auth-exception.filter";
import { MailModule } from "../mail/mail.module";
import { MailService } from "../mail/mail.service";
import { AuthEmailPayload } from "./interfaces/auth-email-payload.interface";
import { OrganizationInvitationPayload } from "./interfaces/organization-invitation-payload.interface";

@Module({
  imports: [
    BetterAuthModule.forRoot({ auth, disableTrustedOriginsCors: true }),
    MailModule,
  ],
  providers: [
    authEventsProvider,
    { provide: APP_FILTER, useClass: BetterAuthExceptionFilter },
  ],
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
    this.authEvents.on(
      "organization-invitation",
      (data: OrganizationInvitationPayload) => {
        void (
          this.mail as unknown as {
            sendOrganizationInvitation: (
              payload: OrganizationInvitationPayload,
            ) => Promise<void>;
          }
        ).sendOrganizationInvitation(data);
      },
    );
  }
}

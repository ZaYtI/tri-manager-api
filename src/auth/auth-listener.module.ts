import { Module, OnModuleInit } from "@nestjs/common";
import { MailModule } from "../mail/mail.module";
import { MailService } from "../mail/mail.service";
import { authEvents } from "../utils/auth";

@Module({
  imports: [MailModule],
})
export class AuthListenerModule implements OnModuleInit {
  constructor(private readonly mailService: MailService) {}
  onModuleInit() {
    authEvents.on(
      "reset-password",
      (data: { email: string; name: string; url: string; token: string }) => {
        void this.mailService.sendResetPassword(data);
      },
    );
  }
}

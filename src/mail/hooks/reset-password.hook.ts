import { Injectable } from "@nestjs/common";
import { Hook, AfterHook } from "@thallesp/nestjs-better-auth";
import type { AuthHookContext } from "@thallesp/nestjs-better-auth";
import { MailService } from "../mail.service";
import { User } from "better-auth";

interface ForgetPassword {
  user: User;
  url: string;
  token: string;
}

@Hook()
@Injectable()
export class ResetPasswordHook {
  constructor(private readonly mailService: MailService) {}

  @AfterHook("/request-password-reset")
  async handle(ctx: AuthHookContext) {
    console.log(ctx.body);
    const body = ctx.body as ForgetPassword;
    const email = body?.user.email;
    const url = body?.url;
    const name = body.user.name;
    const token = body.token;

    if (!email || !url) {
      console.warn("[ResetPasswordHook] Missing email or url in context");
      return;
    }

    await this.mailService.sendResetPassword({ email, name, url, token });
  }
}

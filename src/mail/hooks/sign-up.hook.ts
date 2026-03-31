import { Injectable } from "@nestjs/common";
import { Hook, AfterHook } from "@thallesp/nestjs-better-auth";
import type { AuthHookContext } from "@thallesp/nestjs-better-auth";
import { MailService } from "../mail.service";
import { signUpBody } from "../interfaces/sign-up-body.interface";

@Hook()
@Injectable()
export class SignUpHook {
  constructor(private readonly mailService: MailService) {}

  @AfterHook("/sign-up/email")
  async handle(ctx: AuthHookContext) {
    const body = ctx.body as signUpBody;

    const email = body.email;
    const name = body.name ?? email;
    const url = (ctx.context?.url as string | undefined) ?? body.url;

    await this.mailService.sendWelcome({ email, name });

    if (url) {
      await this.mailService.sendEmailVerification({ email, name, url });
    }
  }
}

import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendResetPassword(data: {
    email: string;
    name: string;
    url: string;
    token: string;
  }): Promise<void> {
    await this.mailerService.sendMail({
      to: data.email,
      subject: "Réinitialisation de votre mot de passe",
      template: "auth/reset-password",
      context: {
        name: data.name,
        url: data.url,
        token: data.token,
        expiresIn: "1 heure",
      },
    });
  }

  async sendVerificationEmail(data: {
    email: string;
    name: string;
    url: string;
  }) {
    await this.mailerService.sendMail({
      to: data.email,
      subject: "Vérifiez votre adresse email",
      template: "auth/email-verification",
      context: {
        name: data.name,
        url: data.url,
      },
    });
  }

  async sendOrganizationInvitation(data: {
    email: string;
    invitedByName: string;
    invitedByEmail: string;
    organizationName: string;
    inviteLink: string;
  }) {
    await this.mailerService.sendMail({
      to: data.email,
      subject: `Invitation à rejoindre ${data.organizationName}`,
      template: "organization/organization-invitation",
      context: {
        invitedByName: data.invitedByName,
        invitedByEmail: data.invitedByEmail,
        organizationName: data.organizationName,
        inviteLink: data.inviteLink,
      },
    });
  }
}

import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { auth } from "~/auth/utils/auth";
import { ORG_DEFAULT_MEMBER_ROLE } from "~/organization/role/config/access-control";
import { InvitationEntity } from "./entities/invitation.entity";
import { InvitationRole } from "./dto/invitation.dto";

@Injectable()
export class InvitationService {
  constructor(
    @InjectRepository(InvitationEntity)
    private readonly invitations: Repository<InvitationEntity>,
  ) {}

  findAll(orgId: string, headers: Headers) {
    return auth.api.listInvitations({
      query: { organizationId: orgId },
      headers,
    });
  }

  create(
    orgId: string,
    data: { email: string; role?: InvitationRole; resend?: boolean },
    headers: Headers,
  ) {
    return auth.api.createInvitation({
      body: {
        email: data.email.trim().toLowerCase(),
        role: data.role ?? ORG_DEFAULT_MEMBER_ROLE,
        organizationId: orgId,
        resend: data.resend,
      },
      headers,
    });
  }

  cancel(invitationId: string, headers: Headers) {
    return auth.api.cancelInvitation({ body: { invitationId }, headers });
  }

  accept(invitationId: string, headers: Headers) {
    return auth.api.acceptInvitation({ body: { invitationId }, headers });
  }

  reject(invitationId: string, headers: Headers) {
    return auth.api.rejectInvitation({ body: { invitationId }, headers });
  }

  async getPublic(invitationId: string) {
    const invitation = await this.invitations.findOne({
      where: { id: invitationId },
      relations: { organization: true },
    });
    if (!invitation) throw new NotFoundException("Invitation introuvable");

    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expired: invitation.expiresAt.getTime() < Date.now(),
      organization: {
        id: invitation.organizationId,
        name: invitation.organization?.name ?? null,
      },
    };
  }
}

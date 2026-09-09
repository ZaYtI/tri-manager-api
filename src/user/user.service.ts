import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { auth } from "~/auth/utils/auth";
import { MemberEntity } from "~/organization/member/entities/member.entity";
import { User } from "./entities/user.entity";
import { UserOrganizationMembership } from "./user.types";

const FRONT_ORIGIN = process.env.FRONT_ORIGIN ?? "http://localhost:3000";
const VERIFY_EMAIL_CALLBACK = `${FRONT_ORIGIN}/verify-email`;

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(MemberEntity)
    private readonly members: Repository<MemberEntity>,
  ) {}

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        "id",
        "name",
        "email",
        "role",
        "emailVerified",
        "image",
        "banned",
        "banReason",
        "createdAt",
        "updatedAt",
      ],
    });
    if (!user) throw new NotFoundException("Utilisateur introuvable");

    return user;
  }

  async sendVerificationEmail(email: string) {
    const normalized = email.trim().toLowerCase();
    const user = await this.userRepository.findOne({
      where: { email: normalized },
      select: ["id", "emailVerified"],
    });
    if (!user) throw new NotFoundException("Utilisateur introuvable");
    if (user.emailVerified) {
      throw new BadRequestException("Cet email est déjà vérifié");
    }

    await auth.api.sendVerificationEmail({
      body: { email: normalized, callbackURL: VERIFY_EMAIL_CALLBACK },
    });
    return { success: true };
  }

  async findOrganizations(
    userId: string,
  ): Promise<UserOrganizationMembership[]> {
    const rows = await this.members.find({
      where: { userId },
      relations: { organization: true },
      order: { createdAt: "ASC" },
    });

    return rows.map((row) => ({
      memberId: row.id,
      role: row.role,
      joinedAt: row.createdAt,
      organization: {
        id: row.organization.id,
        name: row.organization.name,
        slug: row.organization.slug,
      },
    }));
  }
}

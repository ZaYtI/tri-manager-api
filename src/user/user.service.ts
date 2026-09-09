import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { MemberEntity } from "~/club/entities/member.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(MemberEntity)
    private readonly memberRepository: Repository<MemberEntity>,
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

    const memberships = await this.memberRepository.find({
      where: { userId: id },
      relations: ["club"],
    });

    return {
      ...user,
      memberships: memberships.map((m) => ({
        memberId: m.id,
        role: m.role,
        joinedAt: m.createdAt,
        club: {
          id: m.club.id,
          name: m.club.name,
          slug: m.club.slug,
        },
      })),
    };
  }
}

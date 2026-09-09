import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
}

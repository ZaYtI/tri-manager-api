import { FindOptionsSelect } from "typeorm";

import { MemberEntity } from "./entities/member.entity";

export const MEMBER_SELECT: FindOptionsSelect<MemberEntity> = {
  id: true,
  role: true,
  createdAt: true,
  userId: true,
  organizationId: true,
  user: {
    id: true,
    name: true,
    email: true,
    image: true,
    role: true,
    banned: true,
    emailVerified: true,
  },
};

export const MEMBER_LIST_COLUMNS = [
  "id",
  "role",
  "createdAt",
  "userId",
  "organizationId",
  "user.id",
  "user.name",
  "user.email",
  "user.image",
  "user.role",
  "user.banned",
  "user.emailVerified",
];

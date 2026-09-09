import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { ClubEntity } from "./club.entity";
import { User } from "~/user/entities/user.entity";

@Entity("member", { synchronize: false })
export class MemberEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  userId: string;

  @Column()
  organizationId: string;

  @Column({ default: "member" })
  role: string;

  @ManyToOne(() => ClubEntity, (club) => club.members)
  @JoinColumn({ name: "organizationId" })
  club: ClubEntity;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  createdAt: Date;
}

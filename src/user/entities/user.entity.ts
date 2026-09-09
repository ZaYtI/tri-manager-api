import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { MemberEntity } from "~/club/entities/member.entity";

@Entity("user", { synchronize: false })
export class User {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: "user" })
  role: string;

  @Column()
  emailVerified: boolean;

  @Column({ nullable: true })
  image: string;

  @Column({ type: "boolean", nullable: true })
  banned: boolean | null;

  @Column({ type: "text", nullable: true })
  banReason: string | null;

  @Column({ type: "timestamptz", nullable: true })
  banExpires: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => MemberEntity, (member) => member.user)
  members: MemberEntity[];
}

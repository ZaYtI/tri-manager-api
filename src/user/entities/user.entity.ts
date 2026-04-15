import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { MemberEntity } from "~/organization/entities/member.entity";

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => MemberEntity, (member) => member.user)
  members: MemberEntity[];
}

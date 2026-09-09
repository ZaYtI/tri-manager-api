import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { MemberEntity } from "./member.entity";

@Entity("organization", { synchronize: false })
export class ClubEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  slug: string;

  @OneToMany(() => MemberEntity, (member: MemberEntity) => member.club)
  members: MemberEntity[];

  @Column()
  createdAt: Date;
}

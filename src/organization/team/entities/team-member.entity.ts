import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

import { User } from "~/user/entities/user.entity";

@Entity("teamMember", { synchronize: false })
export class TeamMemberEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  teamId: string;

  @Column()
  userId: string;

  @Column()
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;
}

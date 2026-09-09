import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

import { User } from "~/user/entities/user.entity";
import { OrganizationEntity } from "../../entities/organization.entity";

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

  @Column()
  createdAt: Date;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: "organizationId" })
  organization: OrganizationEntity;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;
}

import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { OrganizationEntity } from "./organization.entity";
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

  @ManyToOne(() => OrganizationEntity, (org) => org.members)
  @JoinColumn({ name: "organizationId" })
  organization: OrganizationEntity;

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  createdAt: Date;
}

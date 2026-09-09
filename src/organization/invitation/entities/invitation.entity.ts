import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";

import { OrganizationEntity } from "../../entities/organization.entity";

@Entity("invitation", { synchronize: false })
export class InvitationEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  organizationId: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  role: string;

  @Column()
  status: string;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  inviterId: string;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: "organizationId" })
  organization: OrganizationEntity;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { OrganizationEntity } from "~/organization/entities/organization.entity";

@Entity("discipline")
export class DisciplineEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  organizationId: string;

  @Column({ type: "text" })
  name: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: "organizationId" })
  organization: OrganizationEntity;
}

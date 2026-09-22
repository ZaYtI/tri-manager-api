import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { OrganizationEntity } from "~/organization/entities/organization.entity";

@Entity("location")
export class LocationEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  organizationId: string;

  @Column({ type: "text" })
  name: string;

  @Column({ type: "text", nullable: true })
  address: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: "organizationId" })
  organization: OrganizationEntity;
}

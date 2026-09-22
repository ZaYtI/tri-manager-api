import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { OrganizationEntity } from "~/organization/entities/organization.entity";

@Entity("team", { synchronize: false })
export class TeamEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  organizationId: string;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: "organizationId" })
  organization: OrganizationEntity;

  @Column()
  createdAt: Date;

  @Column({ type: "timestamptz", nullable: true })
  updatedAt: Date | null;
}

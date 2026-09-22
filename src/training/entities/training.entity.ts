import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { OrganizationEntity } from "~/organization/entities/organization.entity";
import { LocationEntity } from "~/training/location/entities/location.entity";
import { DisciplineEntity } from "~/training/discipline/entities/discipline.entity";
import { TrainingCoachEntity } from "./training-coach.entity";
import { TrainingTeamEntity } from "./training-team.entity";

export type TrainingStatus = "scheduled" | "cancelled";

@Entity("training")
export class TrainingEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  organizationId: string;

  @Column({ nullable: true })
  locationId: string | null;

  @Column({ nullable: true })
  disciplineId: string | null;

  @Column({ type: "text" })
  title: string;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "timestamptz" })
  startsAt: Date;

  @Column({ type: "timestamptz" })
  endsAt: Date;

  @Column({ type: "text", nullable: true })
  recurrenceRule: string | null;

  @Column({ type: "text", default: "scheduled" })
  status: TrainingStatus;

  @Column({ type: "timestamptz", nullable: true })
  cancelledAt: Date | null;

  @Column({ type: "text", nullable: true })
  cancelReason: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;

  @ManyToOne(() => OrganizationEntity, (organization) => organization.trainings)
  @JoinColumn({ name: "organizationId" })
  organization: OrganizationEntity;

  @ManyToOne(() => LocationEntity, { nullable: true })
  @JoinColumn({ name: "locationId" })
  location: LocationEntity | null;

  @ManyToOne(() => DisciplineEntity, { nullable: true })
  @JoinColumn({ name: "disciplineId" })
  discipline: DisciplineEntity | null;

  @OneToMany(() => TrainingCoachEntity, (link) => link.training)
  trainingCoaches: TrainingCoachEntity[];

  @OneToMany(() => TrainingTeamEntity, (link) => link.training)
  trainingTeams: TrainingTeamEntity[];
}

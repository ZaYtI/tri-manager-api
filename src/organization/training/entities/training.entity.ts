import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { OrganizationEntity } from "~/organization/entities/organization.entity";
import { TeamEntity } from "~/organization/team/entities/team.entity";
import { User } from "~/user/entities/user.entity";
import { LocationEntity } from "~/organization/training/location/entities/location.entity";
import { DisciplineEntity } from "~/organization/training/discipline/entities/discipline.entity";

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

  @ManyToMany(() => User)
  @JoinTable({
    name: "training_coach",
    joinColumn: { name: "trainingId" },
    inverseJoinColumn: { name: "coachId" },
  })
  coaches: User[];

  @ManyToMany(() => TeamEntity)
  @JoinTable({
    name: "training_team",
    joinColumn: { name: "trainingId" },
    inverseJoinColumn: { name: "teamId" },
  })
  teams: TeamEntity[];
}

import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";

import { TeamEntity } from "~/organization/team/entities/team.entity";
import { TrainingEntity } from "./training.entity";

@Entity("training_team")
export class TrainingTeamEntity {
  @PrimaryColumn()
  trainingId: string;

  @PrimaryColumn()
  teamId: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @ManyToOne(() => TrainingEntity, (training) => training.trainingTeams, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "trainingId" })
  training: TrainingEntity;

  @ManyToOne(() => TeamEntity)
  @JoinColumn({ name: "teamId" })
  team: TeamEntity;
}

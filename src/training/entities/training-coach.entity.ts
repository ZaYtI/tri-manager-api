import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";

import { User } from "~/user/entities/user.entity";
import { TrainingEntity } from "./training.entity";

@Entity("training_coach")
export class TrainingCoachEntity {
  @PrimaryColumn()
  trainingId: string;

  @PrimaryColumn()
  coachId: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @ManyToOne(() => TrainingEntity, (training) => training.trainingCoaches, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "trainingId" })
  training: TrainingEntity;

  @ManyToOne(() => User)
  @JoinColumn({ name: "coachId" })
  coach: User;
}

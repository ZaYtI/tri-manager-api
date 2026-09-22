import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { TrainingEntity } from "~/training/entities/training.entity";

@Entity("organization", { synchronize: false })
export class OrganizationEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  slug: string;

  @Column({ default: true })
  active: boolean;

  @OneToMany(() => TrainingEntity, (training) => training.organization)
  trainings: TrainingEntity[];

  @Column()
  createdAt: Date;
}

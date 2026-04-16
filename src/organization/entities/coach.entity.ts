import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { MemberEntity } from "~/organization/entities/member.entity";

@Entity("coach")
export class CoachEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  memberId: string;

  @OneToOne(() => MemberEntity)
  @JoinColumn({ name: "memberId" })
  member: MemberEntity;

  @Column({ nullable: true })
  speciality: string;

  @Column({ default: "active" })
  status: string;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

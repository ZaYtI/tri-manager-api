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

@Entity("athlete")
export class AthleteEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  memberId: string;

  @OneToOne(() => MemberEntity)
  @JoinColumn({ name: "memberId" })
  member: MemberEntity;

  @Column({ nullable: true, type: "date" })
  dateOfBirth: Date;

  @Column({ nullable: true })
  licenseNumber: string;

  @Column({ nullable: true, type: "date" })
  licenseExpirationDate: Date;

  @Column({ default: "active" })
  status: string;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

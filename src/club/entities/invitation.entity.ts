import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

@Entity("invitation", { synchronize: false })
export class InvitationEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  organizationId: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  role: string;

  @Column()
  status: string;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  inviterId: string;
}

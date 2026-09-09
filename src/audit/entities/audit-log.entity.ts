import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("audit_log")
export class AuditLogEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({ type: "text" })
  action: string;

  @Column({ type: "text", nullable: true })
  actorId: string | null;

  @Column({ type: "text", nullable: true })
  actorEmail: string | null;

  @Column({ type: "text", nullable: true })
  impersonatedBy: string | null;

  @Column({ type: "text", nullable: true })
  targetType: string | null;

  @Index()
  @Column({ type: "text", nullable: true })
  targetId: string | null;

  @Column({ type: "text", nullable: true })
  targetLabel: string | null;

  @Index()
  @Column({ type: "text", nullable: true })
  organizationId: string | null;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;
}

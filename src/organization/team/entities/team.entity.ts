import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("team", { synchronize: false })
export class TeamEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  organizationId: string;

  @Column()
  createdAt: Date;

  @Column({ type: "timestamptz", nullable: true })
  updatedAt: Date | null;
}

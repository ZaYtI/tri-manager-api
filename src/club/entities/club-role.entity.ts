import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("organizationRole", { synchronize: false })
export class ClubRoleEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  organizationId: string;

  @Column()
  role: string;

  @Column({ type: "text" })
  permission: string;

  @Column()
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;
}

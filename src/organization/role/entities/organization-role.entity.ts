import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity("organizationRole", { synchronize: false })
export class OrganizationRoleEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  organizationId: string;

  @Column()
  role: string;

  @Column()
  permission: string;

  @Column()
  createdAt: Date;
}

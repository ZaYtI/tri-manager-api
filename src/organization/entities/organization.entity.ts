import { Entity, PrimaryColumn, Column } from "typeorm";

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

  @Column()
  createdAt: Date;
}

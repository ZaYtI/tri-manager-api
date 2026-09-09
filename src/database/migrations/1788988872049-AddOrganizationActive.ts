import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrganizationActive1788988872049 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "active" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization" DROP COLUMN IF EXISTS "active"`,
    );
  }
}

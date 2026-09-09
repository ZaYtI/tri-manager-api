import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuditLog1788989118363 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "audit_log" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "action" text NOT NULL,
        "actorId" text,
        "actorEmail" text,
        "impersonatedBy" text,
        "targetType" text,
        "targetId" text,
        "targetLabel" text,
        "organizationId" text,
        "metadata" jsonb,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_log" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_audit_log_action" ON "audit_log" ("action")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_audit_log_targetId" ON "audit_log" ("targetId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_audit_log_organizationId" ON "audit_log" ("organizationId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_audit_log_createdAt" ON "audit_log" ("createdAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_log"`);
  }
}

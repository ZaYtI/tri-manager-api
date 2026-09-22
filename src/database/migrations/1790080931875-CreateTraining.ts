import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTraining1790080931875 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "location" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "organizationId" text NOT NULL,
        "name" text NOT NULL,
        "address" text,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_location" PRIMARY KEY ("id"),
        CONSTRAINT "FK_location_organization" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_location_organizationId" ON "location" ("organizationId")`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "discipline" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "organizationId" text NOT NULL,
        "name" text NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_discipline" PRIMARY KEY ("id"),
        CONSTRAINT "FK_discipline_organization" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_discipline_organizationId" ON "discipline" ("organizationId")`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "training" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "organizationId" text NOT NULL,
        "locationId" uuid,
        "disciplineId" uuid,
        "title" text NOT NULL,
        "description" text,
        "startsAt" timestamptz NOT NULL,
        "endsAt" timestamptz NOT NULL,
        "recurrenceRule" text,
        "status" text NOT NULL DEFAULT 'scheduled',
        "cancelledAt" timestamptz,
        "cancelReason" text,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_training" PRIMARY KEY ("id"),
        CONSTRAINT "FK_training_organization" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_training_location" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_training_discipline" FOREIGN KEY ("disciplineId") REFERENCES "discipline"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_training_organizationId" ON "training" ("organizationId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_training_locationId" ON "training" ("locationId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_training_disciplineId" ON "training" ("disciplineId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_training_startsAt" ON "training" ("startsAt")`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "training_coach" (
        "trainingId" uuid NOT NULL,
        "coachId" text NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_training_coach" PRIMARY KEY ("trainingId", "coachId"),
        CONSTRAINT "FK_training_coach_training" FOREIGN KEY ("trainingId") REFERENCES "training"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_training_coach_user" FOREIGN KEY ("coachId") REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_training_coach_coachId" ON "training_coach" ("coachId")`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "training_team" (
        "trainingId" uuid NOT NULL,
        "teamId" text NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_training_team" PRIMARY KEY ("trainingId", "teamId"),
        CONSTRAINT "FK_training_team_training" FOREIGN KEY ("trainingId") REFERENCES "training"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_training_team_team" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_training_team_teamId" ON "training_team" ("teamId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "training_team"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "training_coach"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "training"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "discipline"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "location"`);
  }
}

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDisasterNotifications1759075453663 implements MigrationInterface {
    name = 'AddDisasterNotifications1759075453663'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."userPreferences_notificationfrequency_enum" AS ENUM('daily', 'weekly')`);
        await queryRunner.query(`CREATE TABLE "userPreferences" ("userId" uuid NOT NULL, "webNotifications" boolean NOT NULL DEFAULT true, "emailNotifications" boolean NOT NULL DEFAULT true, "notificationFrequency" "public"."userPreferences_notificationfrequency_enum" NOT NULL DEFAULT 'daily', CONSTRAINT "PK_4f8d527eeb2409b3f726535b1e3" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`ALTER TABLE "disasterNotification" ALTER COLUMN "firstSentAt" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "disasterNotification" ALTER COLUMN "lastSentAt" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "disasterNotification" ALTER COLUMN "acknowledgedAt" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "userPreferences" ADD CONSTRAINT "FK_4f8d527eeb2409b3f726535b1e3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "userPreferences" DROP CONSTRAINT "FK_4f8d527eeb2409b3f726535b1e3"`);
        await queryRunner.query(`ALTER TABLE "disasterNotification" ALTER COLUMN "acknowledgedAt" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "disasterNotification" ALTER COLUMN "lastSentAt" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "disasterNotification" ALTER COLUMN "firstSentAt" SET NOT NULL`);
        await queryRunner.query(`DROP TABLE "userPreferences"`);
        await queryRunner.query(`DROP TYPE "public"."userPreferences_notificationfrequency_enum"`);
    }

}

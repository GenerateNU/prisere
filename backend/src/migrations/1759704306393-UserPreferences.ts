import { MigrationInterface, QueryRunner } from "typeorm";

export class UserPreferences1759704306393 implements MigrationInterface {
    name = 'UserPreferences1759704306393'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "userPreferences"`)
        await queryRunner.query(`CREATE TYPE "public"."user_preferences_notificationfrequency_enum" AS ENUM('daily', 'weekly')`);
        await queryRunner.query(`CREATE TABLE "user_preferences" ("userId" uuid NOT NULL, "emailEnabled" boolean NOT NULL DEFAULT true, "webNotificationsEnabled" boolean NOT NULL DEFAULT true, "notificationFrequency" "public"."user_preferences_notificationfrequency_enum" NOT NULL DEFAULT 'daily', CONSTRAINT "PK_b6202d1cacc63a0b9c8dac2abd4" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_86586021a26d1180b0968f98502"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_86586021a26d1180b0968f98502" UNIQUE ("companyId")`);
        await queryRunner.query(`ALTER TABLE "user_preferences" ADD CONSTRAINT "FK_b6202d1cacc63a0b9c8dac2abd4" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_86586021a26d1180b0968f98502" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_86586021a26d1180b0968f98502"`);
        await queryRunner.query(`ALTER TABLE "user_preferences" DROP CONSTRAINT "FK_b6202d1cacc63a0b9c8dac2abd4"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_86586021a26d1180b0968f98502"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_86586021a26d1180b0968f98502" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`DROP TABLE "user_preferences"`);
        await queryRunner.query(`DROP TYPE "public"."user_preferences_notificationfrequency_enum"`);
    }

}

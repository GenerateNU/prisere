import { MigrationInterface, QueryRunner } from "typeorm";

export class What1760304552845 implements MigrationInterface {
    name = 'What1760304552845'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "disasterNotification" RENAME COLUMN "acknowledgedAt" TO "readAt"`);
        await queryRunner.query(`ALTER TABLE "location_address" ALTER COLUMN "fipsStateCode" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "location_address" ALTER COLUMN "fipsCountyCode" SET NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."disasterNotification_notificationstatus_enum" RENAME TO "disasterNotification_notificationstatus_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."disasterNotification_notificationstatus_enum" AS ENUM('unread', 'read')`);
        await queryRunner.query(`ALTER TABLE "disasterNotification" ALTER COLUMN "notificationStatus" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "disasterNotification" ALTER COLUMN "notificationStatus" TYPE "public"."disasterNotification_notificationstatus_enum" USING "notificationStatus"::"text"::"public"."disasterNotification_notificationstatus_enum"`);
        await queryRunner.query(`ALTER TABLE "disasterNotification" ALTER COLUMN "notificationStatus" SET DEFAULT 'unread'`);
        await queryRunner.query(`DROP TYPE "public"."disasterNotification_notificationstatus_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_86586021a26d1180b0968f98502"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_86586021a26d1180b0968f98502" UNIQUE ("companyId")`);
        await queryRunner.query(`ALTER TABLE "invoice_line_item" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "invoice_line_item" ADD "description" character varying(400)`);
        await queryRunner.query(`ALTER TABLE "disasterNotification" ADD CONSTRAINT "FK_452b579090821ce5e919a93c768" FOREIGN KEY ("locationAddressId") REFERENCES "location_address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_86586021a26d1180b0968f98502" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_86586021a26d1180b0968f98502"`);
        await queryRunner.query(`ALTER TABLE "disasterNotification" DROP CONSTRAINT "FK_452b579090821ce5e919a93c768"`);
        await queryRunner.query(`ALTER TABLE "invoice_line_item" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "invoice_line_item" ADD "description" character varying(250)`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_86586021a26d1180b0968f98502"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_86586021a26d1180b0968f98502" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE TYPE "public"."disasterNotification_notificationstatus_enum_old" AS ENUM('unread', 'read', 'acknowledged')`);
        await queryRunner.query(`ALTER TABLE "disasterNotification" ALTER COLUMN "notificationStatus" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "disasterNotification" ALTER COLUMN "notificationStatus" TYPE "public"."disasterNotification_notificationstatus_enum_old" USING "notificationStatus"::"text"::"public"."disasterNotification_notificationstatus_enum_old"`);
        await queryRunner.query(`ALTER TABLE "disasterNotification" ALTER COLUMN "notificationStatus" SET DEFAULT 'unread'`);
        await queryRunner.query(`DROP TYPE "public"."disasterNotification_notificationstatus_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."disasterNotification_notificationstatus_enum_old" RENAME TO "disasterNotification_notificationstatus_enum"`);
        await queryRunner.query(`ALTER TABLE "location_address" ALTER COLUMN "fipsCountyCode" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "location_address" ALTER COLUMN "fipsStateCode" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "disasterNotification" RENAME COLUMN "readAt" TO "acknowledgedAt"`);
    }

}

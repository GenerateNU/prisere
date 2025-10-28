import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateNotificationTable1760641485269 implements MigrationInterface {
    name = 'UpdateNotificationTable1760641485269'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "disasterNotification" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "disasterNotification" ADD "locationAddressId" uuid`);
        await queryRunner.query(`ALTER TYPE "public"."disasterNotification_notificationstatus_enum" RENAME TO "disasterNotification_notificationstatus_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."disasterNotification_notificationstatus_enum" AS ENUM('unread', 'read')`);
        await queryRunner.query(`ALTER TABLE "disasterNotification" ALTER COLUMN "notificationStatus" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "disasterNotification" ALTER COLUMN "notificationStatus" TYPE "public"."disasterNotification_notificationstatus_enum" USING "notificationStatus"::"text"::"public"."disasterNotification_notificationstatus_enum"`);
        await queryRunner.query(`ALTER TABLE "disasterNotification" ALTER COLUMN "notificationStatus" SET DEFAULT 'unread'`);
        await queryRunner.query(`DROP TYPE "public"."disasterNotification_notificationstatus_enum_old"`);
        await queryRunner.query(`ALTER TABLE "disasterNotification" ADD CONSTRAINT "FK_452b579090821ce5e919a93c768" FOREIGN KEY ("locationAddressId") REFERENCES "location_address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "disasterNotification" DROP CONSTRAINT "FK_452b579090821ce5e919a93c768"`);
        await queryRunner.query(`CREATE TYPE "public"."disasterNotification_notificationstatus_enum_old" AS ENUM('unread', 'read', 'acknowledged')`);
        await queryRunner.query(`ALTER TABLE "disasterNotification" ALTER COLUMN "notificationStatus" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "disasterNotification" ALTER COLUMN "notificationStatus" TYPE "public"."disasterNotification_notificationstatus_enum_old" USING "notificationStatus"::"text"::"public"."disasterNotification_notificationstatus_enum_old"`);
        await queryRunner.query(`ALTER TABLE "disasterNotification" ALTER COLUMN "notificationStatus" SET DEFAULT 'unread'`);
        await queryRunner.query(`DROP TYPE "public"."disasterNotification_notificationstatus_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."disasterNotification_notificationstatus_enum_old" RENAME TO "disasterNotification_notificationstatus_enum"`);
        await queryRunner.query(`ALTER TABLE "disasterNotification" DROP COLUMN "locationAddressId"`);
        await queryRunner.query(`ALTER TABLE "disasterNotification" DROP COLUMN "createdAt"`);
    }

}

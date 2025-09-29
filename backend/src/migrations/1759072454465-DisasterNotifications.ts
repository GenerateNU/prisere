import { MigrationInterface, QueryRunner } from "typeorm";

export class DisasterNotifications1759072454465 implements MigrationInterface {
    name = 'DisasterNotifications1759072454465'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."disasterNotification_notificationtype_enum" AS ENUM('web', 'email')`);
        await queryRunner.query(`CREATE TYPE "public"."disasterNotification_notificationstatus_enum" AS ENUM('unread', 'read', 'acknowledged')`);
        await queryRunner.query(`CREATE TABLE "disasterNotification" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "userId" uuid NOT NULL,
            "femaDisasterId" character varying NOT NULL,
            "notificationType" "public"."disasterNotification_notificationtype_enum" NOT NULL,
            "notificationStatus" "public"."disasterNotification_notificationstatus_enum" NOT NULL DEFAULT 'unread',
            "firstSentAt" TIMESTAMP NOT NULL,
            "lastSentAt" TIMESTAMP NOT NULL,
            "acknowledgedAt" TIMESTAMP NOT NULL,
            CONSTRAINT "PK_e910e9a1629b878751458edf731" PRIMARY KEY ("id")
        )`);
        await queryRunner.query(`ALTER TABLE "disasterNotification" ADD CONSTRAINT "FK_520e2b43d1ce6828e112c82927e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "disasterNotification" ADD CONSTRAINT "FK_4313c838cd09ff0a0f599b986a8" FOREIGN KEY ("femaDisasterId") REFERENCES "fema_disaster"("femaId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "disasterNotification" DROP CONSTRAINT "FK_4313c838cd09ff0a0f599b986a8"`);
        await queryRunner.query(`ALTER TABLE "disasterNotification" DROP CONSTRAINT "FK_520e2b43d1ce6828e112c82927e"`);
        await queryRunner.query(`DROP TABLE "disasterNotification"`);
        await queryRunner.query(`DROP TYPE "public"."disasterNotification_notificationstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."disasterNotification_notificationtype_enum"`);
    }
}
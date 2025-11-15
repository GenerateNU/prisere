import { MigrationInterface, QueryRunner } from "typeorm";

export class NotificationRefactor1763222988200 implements MigrationInterface {
    name = 'NotificationRefactor1763222988200'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "disasterNotification" DROP COLUMN "notificationType"`);
        await queryRunner.query(`DROP TYPE "public"."disasterNotification_notificationtype_enum"`);
        await queryRunner.query(`ALTER TABLE "disasterNotification" ADD "isWeb" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "disasterNotification" ADD "isEmail" boolean NOT NULL DEFAULT true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "disasterNotification" DROP COLUMN "isEmail"`);
        await queryRunner.query(`ALTER TABLE "disasterNotification" DROP COLUMN "isWeb"`);
        await queryRunner.query(`CREATE TYPE "public"."disasterNotification_notificationtype_enum" AS ENUM('web', 'email')`);
        await queryRunner.query(`ALTER TABLE "disasterNotification" ADD "notificationType" "public"."disasterNotification_notificationtype_enum" NOT NULL`);
    }

}

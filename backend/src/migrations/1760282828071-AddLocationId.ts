import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLocationId1760282828071 implements MigrationInterface {
    name = 'AddCreatedAt17AddLocationId176028282807160234222207';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" ADD "locationAddressId" uuid`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "locationAddressId"`);
    }
}


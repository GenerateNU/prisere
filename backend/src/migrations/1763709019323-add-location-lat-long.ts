import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLocationLatLong1763709019323 implements MigrationInterface {
    name = 'AddLocationLatLong1763709019323'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "location_address" ADD "lat" double precision NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "location_address" ADD "long" double precision NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "location_address" DROP COLUMN "long"`);
        await queryRunner.query(`ALTER TABLE "location_address" DROP COLUMN "lat"`);
    }

}

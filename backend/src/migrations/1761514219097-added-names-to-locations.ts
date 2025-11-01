import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedNamesToLocations1761514219097 implements MigrationInterface {
    name = 'AddedNamesToLocations1761514219097'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "location_address" ADD "alias" character varying`);
        await queryRunner.query(`UPDATE "location_address" SET "alias" = COALESCE("streetAddress", 'Location') WHERE "alias" IS NULL`);
        await queryRunner.query(`ALTER TABLE "location_address" ALTER COLUMN "alias" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "location_address" DROP COLUMN "alias"`);
    }

}

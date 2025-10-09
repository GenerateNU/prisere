import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFipsToLocationAddress1759946366549 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "location_address" ADD "fipsStateCode" integer`);
        await queryRunner.query(`ALTER TABLE "location_address" ADD "fipsCountyCode" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "location_address" DROP COLUMN "fipsCountyCode"`);
        await queryRunner.query(`ALTER TABLE "location_address" DROP COLUMN "fipsStateCode"`);
    }
}
import { MigrationInterface, QueryRunner } from "typeorm";

export class CleanUpMigration1761498562378 implements MigrationInterface {
    name = 'CleanUpMigration1761498562378'

     public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "location_address" ADD "fipsStateCode" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "location_address" ADD "fipsCountyCode" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_86586021a26d1180b0968f98502"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "UQ_86586021a26d1180b0968f98502" UNIQUE ("companyId")`);
        await queryRunner.query(`ALTER TABLE "invoice_line_item" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "invoice_line_item" ADD "description" character varying(400)`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_86586021a26d1180b0968f98502" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_86586021a26d1180b0968f98502"`);
        await queryRunner.query(`ALTER TABLE "invoice_line_item" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "invoice_line_item" ADD "description" character varying(250)`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "UQ_86586021a26d1180b0968f98502"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_86586021a26d1180b0968f98502" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "location_address" DROP COLUMN "fipsCountyCode"`);
        await queryRunner.query(`ALTER TABLE "location_address" DROP COLUMN "fipsStateCode"`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedCompanyIdToLocation1759329931554 implements MigrationInterface {
    name = "AddedCompanyIdToLocation1759329931554";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "location_address" ADD "companyId" uuid NOT NULL`);
        await queryRunner.query(
            `ALTER TABLE "location_address" ADD CONSTRAINT "FK_fed589b8a6aa3ddec9b5b9c1383" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "location_address" DROP CONSTRAINT "FK_fed589b8a6aa3ddec9b5b9c1383"`);
        await queryRunner.query(`ALTER TABLE "location_address" DROP COLUMN "companyId"`);
    }
}

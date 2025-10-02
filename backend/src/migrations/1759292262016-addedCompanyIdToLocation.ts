import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedCompanyIdToLocation1759292262016 implements MigrationInterface {
    name = 'AddedCompanyIdToLocation1759292262016'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fema_disaster" DROP CONSTRAINT "PK_66d22c77dd61fd66f461ddae43a"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" DROP COLUMN "fipsStateCode"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" DROP COLUMN "incidentBeginDate"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" DROP COLUMN "incidentEndDate"`);
        await queryRunner.query(`ALTER TABLE "location_address" ADD "companyId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" ADD "femaId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" ADD CONSTRAINT "PK_66d22c77dd61fd66f461ddae43a" PRIMARY KEY ("femaId")`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" ADD "state" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" ADD "startDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" ADD "endDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "location_address" ADD CONSTRAINT "FK_fed589b8a6aa3ddec9b5b9c1383" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "location_address" DROP CONSTRAINT "FK_fed589b8a6aa3ddec9b5b9c1383"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" DROP COLUMN "endDate"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" DROP COLUMN "startDate"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" DROP COLUMN "state"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" DROP CONSTRAINT "PK_66d22c77dd61fd66f461ddae43a"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" DROP COLUMN "femaId"`);
        await queryRunner.query(`ALTER TABLE "location_address" DROP COLUMN "companyId"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" ADD "incidentEndDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" ADD "incidentBeginDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" ADD "fipsStateCode" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" ADD "id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" ADD CONSTRAINT "PK_66d22c77dd61fd66f461ddae43a" PRIMARY KEY ("id")`);
    }

}

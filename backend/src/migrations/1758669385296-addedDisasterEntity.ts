import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedDisasterEntity1758669385296 implements MigrationInterface {
    name = 'AddedDisasterEntity1758669385296'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fema_disaster" DROP COLUMN "state"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" DROP COLUMN "declaration_date"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" DROP COLUMN "start_date"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" DROP COLUMN "end_date"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" DROP COLUMN "fips_county_codes"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" DROP COLUMN "declaration_type"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" DROP COLUMN "designated_area"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" DROP COLUMN "designated_incident_types"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" DROP COLUMN "disaster_number"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" ADD "disasterNumber" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" ADD "fipsStateCode" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" ADD "declarationDate" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" ADD "startDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" ADD "endDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" ADD "fipsCountyCode" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" ADD "declarationType" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" ADD "designatedArea" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" ADD "designatedIncidentTypes" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fema_disaster" DROP COLUMN "designatedIncidentTypes"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" DROP COLUMN "designatedArea"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" DROP COLUMN "declarationType"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" DROP COLUMN "fipsCountyCode"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" DROP COLUMN "endDate"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" DROP COLUMN "startDate"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" DROP COLUMN "declarationDate"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" DROP COLUMN "fipsStateCode"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" DROP COLUMN "disasterNumber"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" ADD "disaster_number" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" ADD "designated_incident_types" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" ADD "designated_area" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" ADD "declaration_type" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" ADD "fips_county_codes" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" ADD "end_date" date`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" ADD "start_date" date`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" ADD "declaration_date" date NOT NULL`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" ADD "state" integer NOT NULL`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedDecoratorsForClaimColumns1759629729511 implements MigrationInterface {
    name = 'AddedDecoratorsForClaimColumns1759629729511'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "company" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "lastQuickBooksImportTime" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_056f7854a7afdba7cbd6d45fc20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying, "companyId" uuid, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "location_address" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "country" character varying NOT NULL, "stateProvince" character varying NOT NULL, "city" character varying NOT NULL, "streetAddress" character varying NOT NULL, "postalCode" integer NOT NULL, "county" character varying, CONSTRAINT "PK_bf1188fd425a5c4f19d6fa22c2e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "fema_disaster" ("id" character varying NOT NULL, "disasterNumber" integer NOT NULL, "fipsStateCode" integer NOT NULL, "declarationDate" TIMESTAMP NOT NULL, "incidentBeginDate" TIMESTAMP, "incidentEndDate" TIMESTAMP, "fipsCountyCode" integer NOT NULL, "declarationType" character varying NOT NULL, "designatedArea" character varying NOT NULL, "designatedIncidentTypes" character varying NOT NULL, CONSTRAINT "PK_355266f9e9404519f7bb4753a2e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "claim" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL, "updatedAt" TIMESTAMP WITH TIME ZONE, "companyId" uuid NOT NULL, "disasterId" character varying NOT NULL, CONSTRAINT "PK_466b305cc2e591047fa1ce58f81" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_86586021a26d1180b0968f98502" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "claim" ADD CONSTRAINT "FK_70b2e2d5da91bd7206e15676bf1" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "claim" ADD CONSTRAINT "FK_febac1e7fc933e9195b5f535e36" FOREIGN KEY ("disasterId") REFERENCES "fema_disaster"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "claim" DROP CONSTRAINT "FK_febac1e7fc933e9195b5f535e36"`);
        await queryRunner.query(`ALTER TABLE "claim" DROP CONSTRAINT "FK_70b2e2d5da91bd7206e15676bf1"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_86586021a26d1180b0968f98502"`);
        await queryRunner.query(`DROP TABLE "claim"`);
        await queryRunner.query(`DROP TABLE "fema_disaster"`);
        await queryRunner.query(`DROP TABLE "location_address"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "company"`);
    }

}

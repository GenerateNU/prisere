import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedDisasterEntity1758828781790 implements MigrationInterface {
    name = 'AddedDisasterEntity1758828781790'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "fema_disaster" ("id" character varying NOT NULL, "disasterNumber" integer NOT NULL, "fipsStateCode" integer NOT NULL, "declarationDate" TIMESTAMP NOT NULL, "incidentBeginDate" TIMESTAMP, "incidentEndDate" TIMESTAMP, "fipsCountyCode" integer NOT NULL, "declarationType" character varying NOT NULL, "designatedArea" character varying NOT NULL, "designatedIncidentTypes" character varying NOT NULL, CONSTRAINT "PK_355266f9e9404519f7bb4753a2e" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "fema_disaster"`);
    }

}

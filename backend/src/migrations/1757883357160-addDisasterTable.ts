import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDisasterTable1757883357160 implements MigrationInterface {
    name = 'AddDisasterTable1757883357160'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "fema_disaster" ("id" character varying NOT NULL, "state" integer NOT NULL, "declaration_date" date NOT NULL, "start_date" date, "end_date" date, "fips_county_codes" integer NOT NULL, "declaration_type" character varying NOT NULL, "designated_area" character varying NOT NULL, "designated_incident_types" character varying NOT NULL, CONSTRAINT "PK_355266f9e9404519f7bb4753a2e" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "fema_disaster"`);
    }

}

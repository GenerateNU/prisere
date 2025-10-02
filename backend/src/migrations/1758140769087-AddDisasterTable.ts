import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDisasterTable1758140769087 implements MigrationInterface {
    name = "AddDisasterTable1758140769087";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "fema_disaster" ("id" character varying NOT NULL, "disasterNumber" integer NOT NULL, "state" integer NOT NULL, "declarationDate" timestamp NOT NULL, "startDate" timestamp, "endDate" timestamp, "fipsCountyCode" integer NOT NULL, "declarationType" character varying NOT NULL, "designatedArea" character varying NOT NULL, "designatedIncidentTypes" character varying NOT NULL, CONSTRAINT "PK_66d22c77dd61fd66f461ddae43a" PRIMARY KEY ("id"))`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "fema_disaster"`);
    }
}

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLocationAddresses1758197300543 implements MigrationInterface {
    name = "AddLocationAddresses1758197300543";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "location_address" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "country" character varying NOT NULL, "stateProvince" character varying NOT NULL, "city" character varying NOT NULL, "streetAddress" character varying NOT NULL, "postalCode" integer NOT NULL, "county" character varying, CONSTRAINT "PK_bf1188fd425a5c4f19d6fa22c2e" PRIMARY KEY ("id"))`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "location_address"`);
    }
}

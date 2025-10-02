import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedCompanyIdToLocation1759329410608 implements MigrationInterface {
    name = 'AddedCompanyIdToLocation1759329410608'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "location_address" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "country" character varying NOT NULL, "stateProvince" character varying NOT NULL, "city" character varying NOT NULL, "streetAddress" character varying NOT NULL, "postalCode" integer NOT NULL, "county" character varying, "companyId" uuid NOT NULL, CONSTRAINT "PK_bf1188fd425a5c4f19d6fa22c2e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "location_address" ADD CONSTRAINT "FK_fed589b8a6aa3ddec9b5b9c1383" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "location_address" DROP CONSTRAINT "FK_fed589b8a6aa3ddec9b5b9c1383"`);
        await queryRunner.query(`DROP TABLE "location_address"`);
    }

}

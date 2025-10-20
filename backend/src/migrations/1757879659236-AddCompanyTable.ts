import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCompanyTable1757879659236 implements MigrationInterface {
    name = "AddCompanyTable1757879659236";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "company" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "lastQuickBooksImportTime" TIMESTAMP, CONSTRAINT "PK_056f7854a7afdba7cbd6d45fc20" PRIMARY KEY ("id"))`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "company"`);
    }
}

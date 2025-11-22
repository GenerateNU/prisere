import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveURLDocumentTable1763601433560 implements MigrationInterface {
    name = 'RemoveURLDocumentTable1763601433560'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document" DROP COLUMN "downloadUrl"`);
        await queryRunner.query(`ALTER TABLE "document" DROP COLUMN "category"`);
        await queryRunner.query(`CREATE TYPE "public"."document_category_enum" AS ENUM('Expenses', 'Revenues', 'Insurance', 'Other')`);
        await queryRunner.query(`ALTER TABLE "document" ADD "category" "public"."document_category_enum"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document" DROP COLUMN "category"`);
        await queryRunner.query(`DROP TYPE "public"."document_category_enum"`);
        await queryRunner.query(`ALTER TABLE "document" ADD "category" character varying`);
        await queryRunner.query(`ALTER TABLE "document" ADD "downloadUrl" character varying NOT NULL`);
    }

}

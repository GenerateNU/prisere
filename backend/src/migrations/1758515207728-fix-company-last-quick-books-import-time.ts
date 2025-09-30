import { MigrationInterface, QueryRunner } from "typeorm";

export class FixCompanyLastQuickBooksImportTime1758515207728 implements MigrationInterface {
    name = "FixCompanyLastQuickBooksImportTime1758515207728";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "lastQuickBooksImportTime"`);
        await queryRunner.query(`ALTER TABLE "company" ADD "lastQuickBooksImportTime" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "lastQuickBooksImportTime"`);
        await queryRunner.query(`ALTER TABLE "company" ADD "lastQuickBooksImportTime" TIMESTAMP`);
    }
}

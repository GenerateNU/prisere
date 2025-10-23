import { MigrationInterface, QueryRunner } from "typeorm";

export class QBImports1761251456667 implements MigrationInterface {
    name = 'QBImports1761251456667'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "lastQuickBooksImportTime"`);
        await queryRunner.query(`ALTER TABLE "company" ADD "lastQuickBooksInvoiceImportTime" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "company" ADD "lastQuickBooksPurchaseImportTime" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "lastQuickBooksPurchaseImportTime"`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "lastQuickBooksInvoiceImportTime"`);
        await queryRunner.query(`ALTER TABLE "company" ADD "lastQuickBooksImportTime" TIMESTAMP WITH TIME ZONE`);
    }

}

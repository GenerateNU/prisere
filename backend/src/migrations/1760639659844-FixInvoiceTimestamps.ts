import { MigrationInterface, QueryRunner } from "typeorm";

export class FixInvoiceTimestamps1760639659844 implements MigrationInterface {
    name = 'FixInvoiceTimestamps1760639659844'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "quickbooksDateCreated"`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD "quickbooksDateCreated" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "invoice_line_item" DROP COLUMN "quickbooksDateCreated"`);
        await queryRunner.query(`ALTER TABLE "invoice_line_item" ADD "quickbooksDateCreated" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice_line_item" DROP COLUMN "quickbooksDateCreated"`);
        await queryRunner.query(`ALTER TABLE "invoice_line_item" ADD "quickbooksDateCreated" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "quickbooksDateCreated"`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD "quickbooksDateCreated" TIMESTAMP`);
    }

}

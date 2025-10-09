import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeDateColumnsInvoices1759967503807 implements MigrationInterface {
    name = 'ChangeDateColumnsInvoices1759967503807'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice" ADD "quickbooksDateCreated" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "invoice_line_item" ADD "quickbooksDateCreated" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "dateCreated" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "invoice_line_item" ALTER COLUMN "dateCreated" SET DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice_line_item" ALTER COLUMN "dateCreated" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "dateCreated" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "invoice_line_item" DROP COLUMN "quickbooksDateCreated"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "quickbooksDateCreated"`);
    }

}

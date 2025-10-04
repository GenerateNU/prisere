import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeInvoiceQuickbooksIdNullable1759613516134 implements MigrationInterface {
    name = 'MakeInvoiceQuickbooksIdNullable1759613516134'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "UQ_384cac72df716a34770ccd55f95"`);
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "quickbooksId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "UQ_384cac72df716a34770ccd55f95" UNIQUE ("quickbooksId", "companyId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "UQ_384cac72df716a34770ccd55f95"`);
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "quickbooksId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "UQ_384cac72df716a34770ccd55f95" UNIQUE ("companyId", "quickbooksId")`);
    }

}

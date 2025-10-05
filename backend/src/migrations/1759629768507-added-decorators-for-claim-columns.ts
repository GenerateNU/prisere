import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedDecoratorsForClaimColumns1759629768507 implements MigrationInterface {
    name = "AddedDecoratorsForClaimColumns1759629768507";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "claim" DROP COLUMN "companyId"`);
        await queryRunner.query(`ALTER TABLE "claim" ADD "companyId" uuid NOT NULL`);
        await queryRunner.query(
            `ALTER TABLE "claim" ADD CONSTRAINT "FK_70b2e2d5da91bd7206e15676bf1" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "claim" ADD CONSTRAINT "FK_febac1e7fc933e9195b5f535e36" FOREIGN KEY ("disasterId") REFERENCES "fema_disaster"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "claim" DROP CONSTRAINT "FK_febac1e7fc933e9195b5f535e36"`);
        await queryRunner.query(`ALTER TABLE "claim" DROP CONSTRAINT "FK_70b2e2d5da91bd7206e15676bf1"`);
        await queryRunner.query(`ALTER TABLE "claim" DROP COLUMN "companyId"`);
        await queryRunner.query(`ALTER TABLE "claim" ADD "companyId" character varying NOT NULL`);
    }
}

import { MigrationInterface, QueryRunner } from "typeorm";

export class FixedClaimUpdatedTime1759625673380 implements MigrationInterface {
    name = "FixedClaimUpdatedTime1759625673380";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "claim" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "claim" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`ALTER TABLE "claim" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "claim" ADD "updatedAt" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "claim" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "claim" ADD "updatedAt" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "claim" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "claim" ADD "createdAt" TIMESTAMP NOT NULL`);
    }
}

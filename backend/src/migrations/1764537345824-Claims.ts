import { MigrationInterface, QueryRunner } from "typeorm";

export class Claims1764537345824 implements MigrationInterface {
    name = "Claims1764537345824";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "self_declared_disaster" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "claim" ADD "name" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "claim" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "self_declared_disaster" ADD "name" character varying NOT NULL`);
    }
}

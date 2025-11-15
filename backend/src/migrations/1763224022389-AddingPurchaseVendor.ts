import { MigrationInterface, QueryRunner } from "typeorm";

export class AddingPurchaseVendor1763224022389 implements MigrationInterface {
    name = 'AddingPurchaseVendor1763224022389'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" ADD "vendor" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" DROP COLUMN "vendor"`);
    }

}

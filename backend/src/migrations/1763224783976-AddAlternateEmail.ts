import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAlternateEmail1763224783976 implements MigrationInterface {
    name = 'AddAlternateEmail1763224783976'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "alternateEmail" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "alternateEmail"`);
    }

}

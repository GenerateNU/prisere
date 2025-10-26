import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedNamesToLocationsAndSelfDisasters1761512744540 implements MigrationInterface {
    name = 'AddedNamesToLocationsAndSelfDisasters1761512744540'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "self_declared_disaster" ADD "name" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "self_declared_disaster" DROP COLUMN "name"`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class EditDocumentTable1763514349037 implements MigrationInterface {
    name = 'EditDocumentTable1763514349037'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document" ADD "category" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document" DROP COLUMN "category"`);
    }

}

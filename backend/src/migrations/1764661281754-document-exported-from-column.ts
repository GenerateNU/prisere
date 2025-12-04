import { MigrationInterface, QueryRunner } from "typeorm";

export class DocumentExportedFromColumn1764661281754 implements MigrationInterface {
    name = 'DocumentExportedFromColumn1764661281754'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document" ADD "exportedClaimID" uuid`);
        await queryRunner.query(`ALTER TABLE "document" ADD CONSTRAINT "FK_74453c649175b5fdd4cd7cbe6fd" FOREIGN KEY ("exportedClaimID") REFERENCES "claim"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document" DROP CONSTRAINT "FK_74453c649175b5fdd4cd7cbe6fd"`);
        await queryRunner.query(`ALTER TABLE "document" DROP COLUMN "exportedClaimID"`);
    }

}

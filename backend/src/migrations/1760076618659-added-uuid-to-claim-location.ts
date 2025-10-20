import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedUuidToClaimLocation1760076618659 implements MigrationInterface {
    name = 'AddedUuidToClaimLocation1760076618659'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "claim_location" DROP CONSTRAINT "PK_4b5e2d14dbd9d21895d618972a5"`);
        await queryRunner.query(`ALTER TABLE "claim_location" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "claim_location" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "claim_location" ADD CONSTRAINT "PK_4b5e2d14dbd9d21895d618972a5" PRIMARY KEY ("id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "claim_location" DROP CONSTRAINT "PK_4b5e2d14dbd9d21895d618972a5"`);
        await queryRunner.query(`ALTER TABLE "claim_location" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "claim_location" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "claim_location" ADD CONSTRAINT "PK_4b5e2d14dbd9d21895d618972a5" PRIMARY KEY ("id")`);
    }

}

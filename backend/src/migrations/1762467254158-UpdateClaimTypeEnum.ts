import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateClaimTypeEnum1762467254158 implements MigrationInterface {
    name = 'UpdateClaimTypeEnum1762467254158'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."claim_status_enum" RENAME TO "claim_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."claim_status_enum" AS ENUM('ACTIVE', 'FILED', 'IN_PROGRESS_DISASTER', 'IN_PROGRESS_PERSONAL', 'IN_PROGRESS_BUSINESS', 'IN_PROGRESS_INSURANCE', 'IN_PROGRESS_EXPORT')`);
        await queryRunner.query(`ALTER TABLE "claim" ALTER COLUMN "status" TYPE "public"."claim_status_enum" USING "status"::"text"::"public"."claim_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."claim_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."claim_status_enum_old" AS ENUM('ACTIVE', 'FILED')`);
        await queryRunner.query(`ALTER TABLE "claim" ALTER COLUMN "status" TYPE "public"."claim_status_enum_old" USING "status"::"text"::"public"."claim_status_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."claim_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."claim_status_enum_old" RENAME TO "claim_status_enum"`);
    }

}

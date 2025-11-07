import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateClaimTableStatusAndInsurance1762534603095 implements MigrationInterface {
    name = 'UpdateClaimTableStatusAndInsurance1762534603095'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "claim" ADD "insurancePolicyId" uuid`);
        await queryRunner.query(`ALTER TYPE "public"."claim_status_enum" RENAME TO "claim_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."claim_status_enum" AS ENUM('ACTIVE', 'FILED', 'IN_PROGRESS_DISASTER', 'IN_PROGRESS_PERSONAL', 'IN_PROGRESS_BUSINESS', 'IN_PROGRESS_INSURANCE', 'IN_PROGRESS_EXPORT')`);
        await queryRunner.query(`ALTER TABLE "claim" ALTER COLUMN "status" TYPE "public"."claim_status_enum" USING "status"::"text"::"public"."claim_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."claim_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "claim" ADD CONSTRAINT "FK_0147bcc69a8fa50f42d498ada66" FOREIGN KEY ("insurancePolicyId") REFERENCES "insurance_policy"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "claim" DROP CONSTRAINT "FK_0147bcc69a8fa50f42d498ada66"`);
        await queryRunner.query(`CREATE TYPE "public"."claim_status_enum_old" AS ENUM('ACTIVE', 'FILED')`);
        await queryRunner.query(`ALTER TABLE "claim" ALTER COLUMN "status" TYPE "public"."claim_status_enum_old" USING "status"::"text"::"public"."claim_status_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."claim_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."claim_status_enum_old" RENAME TO "claim_status_enum"`);
        await queryRunner.query(`ALTER TABLE "claim" DROP COLUMN "insurancePolicyId"`);
    }

}

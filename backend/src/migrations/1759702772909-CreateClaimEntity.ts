import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateClaimEntity1759702772909 implements MigrationInterface {
    name = 'CreateClaimEntity1759702772909'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."claim_status_enum" AS ENUM('ACTIVE', 'FILED')`);
        await queryRunner.query(`CREATE TABLE "claim" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."claim_status_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "companyId" uuid NOT NULL, "disasterId" character varying NOT NULL, CONSTRAINT "UQ_e15a58941d97f6bf90b4b69433c" UNIQUE ("companyId", "disasterId"), CONSTRAINT "PK_466b305cc2e591047fa1ce58f81" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "claim" ADD CONSTRAINT "FK_70b2e2d5da91bd7206e15676bf1" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "claim" ADD CONSTRAINT "FK_febac1e7fc933e9195b5f535e36" FOREIGN KEY ("disasterId") REFERENCES "fema_disaster"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "claim" DROP CONSTRAINT "FK_febac1e7fc933e9195b5f535e36"`);
        await queryRunner.query(`ALTER TABLE "claim" DROP CONSTRAINT "FK_70b2e2d5da91bd7206e15676bf1"`);
        await queryRunner.query(`DROP TABLE "claim"`);
        await queryRunner.query(`DROP TYPE "public"."claim_status_enum"`);
    }

}

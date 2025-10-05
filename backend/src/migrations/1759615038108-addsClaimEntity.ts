import { MigrationInterface, QueryRunner } from "typeorm";

export class AddsClaimEntity1759615038108 implements MigrationInterface {
    name = 'AddsClaimEntity1759615038108'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "claim" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL, "companyId" character varying NOT NULL, "disasterId" character varying NOT NULL, CONSTRAINT "PK_466b305cc2e591047fa1ce58f81" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "claim"`);
    }

}

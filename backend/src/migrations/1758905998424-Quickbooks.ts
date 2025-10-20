import { MigrationInterface, QueryRunner } from "typeorm";

export class Quickbooks1758905998424 implements MigrationInterface {
    name = 'Quickbooks1758905998424'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "quickbooks_session" ("accessToken" character varying NOT NULL, "refreshToken" character varying NOT NULL, "accessExpiryTimestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "refreshExpiryTimestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "companyId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_f038467297bfac7a3c4a163bfd" UNIQUE ("companyId"), CONSTRAINT "PK_21e3f1c58eec6d7fe36cbe5aab1" PRIMARY KEY ("accessToken"))`);
        await queryRunner.query(`CREATE TABLE "quickbooks_pending_o_auth" ("stateId" character varying NOT NULL, "initiatorUserId" uuid NOT NULL, "consumedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_406f18a63e1433ce754641634b9" PRIMARY KEY ("stateId"))`);
        await queryRunner.query(`CREATE TYPE "public"."company_external_source_enum" AS ENUM('quickbooks')`);
        await queryRunner.query(`CREATE TABLE "company_external" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "source" "public"."company_external_source_enum" NOT NULL, "externalId" character varying NOT NULL, "companyId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f4bc596bf38d3448f505eeb9bbc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_d68fa2390343724834edb5553a" ON "company_external" ("source", "externalId") `);
        await queryRunner.query(`ALTER TABLE "company" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "company" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "quickbooks_session" ADD CONSTRAINT "FK_f038467297bfac7a3c4a163bfd0" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "quickbooks_pending_o_auth" ADD CONSTRAINT "FK_4ea5cf2fdd5cd78fcbab40f4b74" FOREIGN KEY ("initiatorUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "company_external" ADD CONSTRAINT "FK_076792823bb926a8143315858dc" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "company_external" DROP CONSTRAINT "FK_076792823bb926a8143315858dc"`);
        await queryRunner.query(`ALTER TABLE "quickbooks_pending_o_auth" DROP CONSTRAINT "FK_4ea5cf2fdd5cd78fcbab40f4b74"`);
        await queryRunner.query(`ALTER TABLE "quickbooks_session" DROP CONSTRAINT "FK_f038467297bfac7a3c4a163bfd0"`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "createdAt"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d68fa2390343724834edb5553a"`);
        await queryRunner.query(`DROP TABLE "company_external"`);
        await queryRunner.query(`DROP TYPE "public"."company_external_source_enum"`);
        await queryRunner.query(`DROP TABLE "quickbooks_pending_o_auth"`);
        await queryRunner.query(`DROP TABLE "quickbooks_session"`);
    }

}

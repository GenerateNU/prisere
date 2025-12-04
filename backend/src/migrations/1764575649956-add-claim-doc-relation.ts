import { MigrationInterface, QueryRunner } from "typeorm";

export class AddClaimDocRelation1764575649956 implements MigrationInterface {
    name = "AddClaimDocRelation1764575649956";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document" DROP CONSTRAINT "FK_6d01193b2c2c5039535f28f2f9a"`);
        await queryRunner.query(
            `CREATE TABLE "claim_uploaded_documents" ("claimId" uuid NOT NULL, "documentId" uuid NOT NULL, CONSTRAINT "PK_cc722a588b00303d7a474d17b35" PRIMARY KEY ("claimId", "documentId"))`
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_5f4ce74d175befa86934bef8e7" ON "claim_uploaded_documents" ("claimId") `
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_ee133e8c24ee149c2fd05998e4" ON "claim_uploaded_documents" ("documentId") `
        );
        await queryRunner.query(`ALTER TABLE "document" DROP CONSTRAINT "REL_6d01193b2c2c5039535f28f2f9"`);
        await queryRunner.query(`ALTER TABLE "document" DROP COLUMN "claimId"`);
        await queryRunner.query(`ALTER TABLE "document" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "document" ADD "createdAt" character varying`);
        await queryRunner.query(`ALTER TABLE "document" DROP COLUMN "lastModified"`);
        await queryRunner.query(`ALTER TABLE "document" ADD "lastModified" character varying`);
        await queryRunner.query(
            `ALTER TABLE "claim_uploaded_documents" ADD CONSTRAINT "FK_5f4ce74d175befa86934bef8e74" FOREIGN KEY ("claimId") REFERENCES "claim"("id") ON DELETE CASCADE ON UPDATE CASCADE`
        );
        await queryRunner.query(
            `ALTER TABLE "claim_uploaded_documents" ADD CONSTRAINT "FK_ee133e8c24ee149c2fd05998e41" FOREIGN KEY ("documentId") REFERENCES "document"("id") ON DELETE CASCADE ON UPDATE CASCADE`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "claim_uploaded_documents" DROP CONSTRAINT "FK_ee133e8c24ee149c2fd05998e41"`
        );
        await queryRunner.query(
            `ALTER TABLE "claim_uploaded_documents" DROP CONSTRAINT "FK_5f4ce74d175befa86934bef8e74"`
        );
        await queryRunner.query(`ALTER TABLE "document" DROP COLUMN "lastModified"`);
        await queryRunner.query(`ALTER TABLE "document" ADD "lastModified" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "document" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "document" ADD "createdAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "document" ADD "claimId" uuid`);
        await queryRunner.query(
            `ALTER TABLE "document" ADD CONSTRAINT "REL_6d01193b2c2c5039535f28f2f9" UNIQUE ("claimId")`
        );
        await queryRunner.query(`DROP INDEX "public"."IDX_ee133e8c24ee149c2fd05998e4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5f4ce74d175befa86934bef8e7"`);
        await queryRunner.query(`DROP TABLE "claim_uploaded_documents"`);
        await queryRunner.query(
            `ALTER TABLE "document" ADD CONSTRAINT "FK_6d01193b2c2c5039535f28f2f9a" FOREIGN KEY ("claimId") REFERENCES "claim"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }
}

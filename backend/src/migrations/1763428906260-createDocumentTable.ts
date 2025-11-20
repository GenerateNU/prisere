import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDocumentTable1763428906260 implements MigrationInterface {
    name = 'CreateDocumentTable1763428906260'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "document" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying NOT NULL, "downloadUrl" character varying NOT NULL, "s3DocumentId" character varying NOT NULL, "createdAt" TIMESTAMP, "lastModified" TIMESTAMP, "userId" uuid, "companyId" uuid NOT NULL, "claimId" uuid, CONSTRAINT "REL_6d01193b2c2c5039535f28f2f9" UNIQUE ("claimId"), CONSTRAINT "PK_e57d3357f83f3cdc0acffc3d777" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "document" ADD CONSTRAINT "FK_7424ddcbdf1e9b067669eb0d3fd" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "document" ADD CONSTRAINT "FK_ba3e67f852e763b7b7dbd741877" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "document" ADD CONSTRAINT "FK_6d01193b2c2c5039535f28f2f9a" FOREIGN KEY ("claimId") REFERENCES "claim"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document" DROP CONSTRAINT "FK_6d01193b2c2c5039535f28f2f9a"`);
        await queryRunner.query(`ALTER TABLE "document" DROP CONSTRAINT "FK_ba3e67f852e763b7b7dbd741877"`);
        await queryRunner.query(`ALTER TABLE "document" DROP CONSTRAINT "FK_7424ddcbdf1e9b067669eb0d3fd"`);
        await queryRunner.query(`DROP TABLE "document"`);
    }

}

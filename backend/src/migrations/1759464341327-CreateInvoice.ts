import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInvoice1759464341327 implements MigrationInterface {
    name = 'CreateInvoice1759464341327'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "invoice" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "companyId" uuid NOT NULL, "quickbooksId" integer NOT NULL, "totalAmountCents" integer NOT NULL, "dateCreated" TIMESTAMP NOT NULL, "lastUpdated" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_384cac72df716a34770ccd55f95" UNIQUE ("quickbooksId", "companyId"), CONSTRAINT "PK_15d25c200d9bcd8a33f698daf18" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_78299c9ae0f0236a353338e3c8a" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "FK_78299c9ae0f0236a353338e3c8a"`);
        await queryRunner.query(`DROP TABLE "invoice"`);
    }

}

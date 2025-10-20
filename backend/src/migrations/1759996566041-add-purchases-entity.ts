import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPurchasesEntity1759996566041 implements MigrationInterface {
    name = "AddPurchasesEntity1759996566041";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "purchase" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "companyId" uuid NOT NULL, "quickBooksId" integer, "totalAmountCents" integer NOT NULL, "isRefund" boolean NOT NULL, "quickbooksDateCreated" TIMESTAMP WITH TIME ZONE, "dateCreated" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdated" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7a5d87d250be1ee4f15d23811de" UNIQUE ("companyId", "quickBooksId"), CONSTRAINT "PK_86cc2ebeb9e17fc9c0774b05f69" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `ALTER TABLE "purchase" ADD CONSTRAINT "FK_8d03ca65b358577e505bf2bdf27" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase" DROP CONSTRAINT "FK_8d03ca65b358577e505bf2bdf27"`);
        await queryRunner.query(`DROP TABLE "purchase"`);
    }
}

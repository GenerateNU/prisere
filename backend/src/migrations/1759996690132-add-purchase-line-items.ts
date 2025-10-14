import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPurchaseLineItems1759996690132 implements MigrationInterface {
    name = "AddPurchaseLineItems1759996690132";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "purchase" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "companyId" uuid NOT NULL, "quickBooksId" integer, "totalAmountCents" integer NOT NULL, "isRefund" boolean NOT NULL, "quickbooksDateCreated" TIMESTAMP WITH TIME ZONE, "dateCreated" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdated" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7a5d87d250be1ee4f15d23811de" UNIQUE ("companyId", "quickBooksId"), CONSTRAINT "PK_86cc2ebeb9e17fc9c0774b05f69" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `CREATE TABLE "purchase_line_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" character varying(400), "purchaseId" uuid NOT NULL, "amountCents" integer NOT NULL, "category" character varying(100), "type" "public"."purchase_line_item_type_enum" NOT NULL, "dateCreated" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdated" TIMESTAMP NOT NULL DEFAULT now(), "quickbooksDateCreated" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_218243ae12106f5db20e1995065" UNIQUE ("purchaseId", "quickBooksId"), CONSTRAINT "PK_3f193d6f0c52c01fae98e01e9fe" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(
            `ALTER TABLE "purchase" ADD CONSTRAINT "FK_8d03ca65b358577e505bf2bdf27" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
        await queryRunner.query(
            `ALTER TABLE "purchase_line_item" ADD CONSTRAINT "FK_d55cdb2fe6c2a36d0f35869b3a3" FOREIGN KEY ("purchaseId") REFERENCES "purchase"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_line_item" DROP CONSTRAINT "FK_d55cdb2fe6c2a36d0f35869b3a3"`);
        await queryRunner.query(`ALTER TABLE "purchase" DROP CONSTRAINT "FK_8d03ca65b358577e505bf2bdf27"`);
        await queryRunner.query(`DROP TABLE "purchase_line_item"`);
        await queryRunner.query(`DROP TABLE "purchase"`);
    }
}

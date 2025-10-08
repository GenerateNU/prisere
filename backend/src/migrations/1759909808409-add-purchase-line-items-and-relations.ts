import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPurchaseLineItemsAndRelations1759909808409 implements MigrationInterface {
    name = "AddPurchaseLineItemsAndRelations1759909808409";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."purchase_line_item_type_enum" AS ENUM('extraneous', 'typical')`);
        await queryRunner.query(
            `CREATE TABLE "purchase_line_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" character varying NOT NULL, "quickBooksId" integer NOT NULL, "purchaseId" uuid NOT NULL, "amountCents" integer NOT NULL, "category" character varying NOT NULL, "type" "public"."purchase_line_item_type_enum" NOT NULL, "dateCreated" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdated" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3f193d6f0c52c01fae98e01e9fe" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(`ALTER TABLE "purchase" ALTER COLUMN "quickBooksId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "purchase" ALTER COLUMN "isRefund" DROP DEFAULT`);
        await queryRunner.query(
            `ALTER TABLE "purchase_line_item" ADD CONSTRAINT "FK_d55cdb2fe6c2a36d0f35869b3a3" FOREIGN KEY ("purchaseId") REFERENCES "purchase"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_line_item" DROP CONSTRAINT "FK_d55cdb2fe6c2a36d0f35869b3a3"`);
        await queryRunner.query(`ALTER TABLE "purchase" ALTER COLUMN "isRefund" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "purchase" ALTER COLUMN "quickBooksId" SET NOT NULL`);
        await queryRunner.query(`DROP TABLE "purchase_line_item"`);
        await queryRunner.query(`DROP TYPE "public"."purchase_line_item_type_enum"`);
    }
}

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPurchaseLineItem1760455756266 implements MigrationInterface {
    name = 'AddPurchaseLineItem1760455756266'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."purchase_line_item_type_enum" AS ENUM('extraneous', 'typical')`);
        await queryRunner.query(`CREATE TABLE "purchase_line_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" character varying(400), "quickBooksId" integer, "purchaseId" uuid NOT NULL, "amountCents" integer NOT NULL, "category" character varying(100), "type" "public"."purchase_line_item_type_enum" NOT NULL, "dateCreated" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdated" TIMESTAMP NOT NULL DEFAULT now(), "quickbooksDateCreated" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_218243ae12106f5db20e1995065" UNIQUE ("purchaseId", "quickBooksId"), CONSTRAINT "PK_3f193d6f0c52c01fae98e01e9fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "purchase_line_item" ADD CONSTRAINT "FK_d55cdb2fe6c2a36d0f35869b3a3" FOREIGN KEY ("purchaseId") REFERENCES "purchase"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_line_item" DROP CONSTRAINT "FK_d55cdb2fe6c2a36d0f35869b3a3"`);
        await queryRunner.query(`DROP TABLE "purchase_line_item"`);
        await queryRunner.query(`DROP TYPE "public"."purchase_line_item_type_enum"`);
    }

}

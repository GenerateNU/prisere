import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInvoiceLineItem1759886988580 implements MigrationInterface {
    name = 'CreateInvoiceLineItem1759886988580'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "invoice_line_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" character varying(250), "invoiceId" uuid NOT NULL, "quickbooksId" integer, "amountCents" integer NOT NULL, "category" character varying(100), "dateCreated" TIMESTAMP NOT NULL, "lastUpdated" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b8ddc7d65920a372246bd7494fb" UNIQUE ("quickbooksId", "invoiceId"), CONSTRAINT "PK_4ffb12a7ac2bb69aa7234f30b85" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "invoice_line_item" ADD CONSTRAINT "FK_b09242561f9c47a3288dc66c186" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice_line_item" DROP CONSTRAINT "FK_b09242561f9c47a3288dc66c186"`);
        await queryRunner.query(`DROP TABLE "invoice_line_item"`);
    }

}

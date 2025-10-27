import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedPurchaseClaimBridge1761505421242 implements MigrationInterface {
    name = 'AddedPurchaseClaimBridge1761505421242'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "claim_purchase_line_items" ("claimId" uuid NOT NULL, "purchaseLineItemId" uuid NOT NULL, CONSTRAINT "PK_29afe6a3778be3fcb4db452ee77" PRIMARY KEY ("claimId", "purchaseLineItemId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5f21b1891630a9b5816afbfe5e" ON "claim_purchase_line_items" ("claimId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c1a102d56f7b83b52a00adad3c" ON "claim_purchase_line_items" ("purchaseLineItemId") `);
        await queryRunner.query(`ALTER TABLE "claim_purchase_line_items" ADD CONSTRAINT "FK_5f21b1891630a9b5816afbfe5ee" FOREIGN KEY ("claimId") REFERENCES "claim"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "claim_purchase_line_items" ADD CONSTRAINT "FK_c1a102d56f7b83b52a00adad3c7" FOREIGN KEY ("purchaseLineItemId") REFERENCES "purchase_line_item"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "claim_purchase_line_items" DROP CONSTRAINT "FK_c1a102d56f7b83b52a00adad3c7"`);
        await queryRunner.query(`ALTER TABLE "claim_purchase_line_items" DROP CONSTRAINT "FK_5f21b1891630a9b5816afbfe5ee"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c1a102d56f7b83b52a00adad3c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5f21b1891630a9b5816afbfe5e"`);
        await queryRunner.query(`DROP TABLE "claim_purchase_line_items"`);
    }

}

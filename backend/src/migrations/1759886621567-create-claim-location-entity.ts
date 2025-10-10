import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateClaimLocationEntity1759886621567 implements MigrationInterface {
    name = 'CreateClaimLocationEntity1759886621567'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "claim_location" ("id" SERIAL NOT NULL, "claimId" uuid NOT NULL, "locationAddressId" uuid NOT NULL, CONSTRAINT "UQ_148e54f6e34f68e8166da5f3006" UNIQUE ("claimId", "locationAddressId"), CONSTRAINT "PK_4b5e2d14dbd9d21895d618972a5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "claim_location" ADD CONSTRAINT "FK_5b60827dd8ce8e8cdb5c3270ee3" FOREIGN KEY ("claimId") REFERENCES "claim"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "claim_location" ADD CONSTRAINT "FK_75cd123f6e79f2437e11c8ae727" FOREIGN KEY ("locationAddressId") REFERENCES "location_address"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "claim_location" DROP CONSTRAINT "FK_75cd123f6e79f2437e11c8ae727"`);
        await queryRunner.query(`ALTER TABLE "claim_location" DROP CONSTRAINT "FK_5b60827dd8ce8e8cdb5c3270ee3"`);
        await queryRunner.query(`DROP TABLE "claim_location"`);
    }

}

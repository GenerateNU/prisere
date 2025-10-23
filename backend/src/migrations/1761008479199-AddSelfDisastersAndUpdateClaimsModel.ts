import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSelfDisastersAndUpdateClaimsModel1761008479199 implements MigrationInterface {
    name = 'AddSelfDisastersAndUpdateClaimsModel1761008479199'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "claim" DROP CONSTRAINT "FK_febac1e7fc933e9195b5f535e36"`);
        await queryRunner.query(`ALTER TABLE "claim" DROP CONSTRAINT "UQ_e15a58941d97f6bf90b4b69433c"`);
        await queryRunner.query(`CREATE TABLE "self_declared_disaster" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "companyId" uuid NOT NULL, "description" character varying NOT NULL, "startDate" TIMESTAMP WITH TIME ZONE NOT NULL, "endDate" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_63dc1bae3c6dc0e9946b5dab6ee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "claim" DROP COLUMN "disasterId"`);
        await queryRunner.query(`ALTER TABLE "claim" ADD "femaDisasterId" character varying`);
        await queryRunner.query(`ALTER TABLE "claim" ADD "selfDisasterId" uuid`);
        await queryRunner.query(`ALTER TABLE "claim" ADD CONSTRAINT "CHK_a02baf7f76754dd9b199eb9ac7" CHECK (("femaDisasterId" IS NOT NULL AND "selfDisasterId" IS NULL) OR ("femaDisasterId" IS NULL AND "selfDisasterId" IS NOT NULL))`);
        await queryRunner.query(`ALTER TABLE "claim" ADD CONSTRAINT "UQ_311aa8eaabdf04785b8db8cd092" UNIQUE ("companyId", "femaDisasterId", "selfDisasterId")`);
        await queryRunner.query(`ALTER TABLE "self_declared_disaster" ADD CONSTRAINT "FK_6cd26cfdcfa0325b8b1b2d14b76" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "claim" ADD CONSTRAINT "FK_75d7b8b5812a3586032a17f7a7b" FOREIGN KEY ("femaDisasterId") REFERENCES "fema_disaster"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "claim" ADD CONSTRAINT "FK_48828395f4275ea5086c6408573" FOREIGN KEY ("selfDisasterId") REFERENCES "self_declared_disaster"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "claim" DROP CONSTRAINT "FK_48828395f4275ea5086c6408573"`);
        await queryRunner.query(`ALTER TABLE "claim" DROP CONSTRAINT "FK_75d7b8b5812a3586032a17f7a7b"`);
        await queryRunner.query(`ALTER TABLE "self_declared_disaster" DROP CONSTRAINT "FK_6cd26cfdcfa0325b8b1b2d14b76"`);
        await queryRunner.query(`ALTER TABLE "claim" DROP CONSTRAINT "UQ_311aa8eaabdf04785b8db8cd092"`);
        await queryRunner.query(`ALTER TABLE "claim" DROP CONSTRAINT "CHK_a02baf7f76754dd9b199eb9ac7"`);
        await queryRunner.query(`ALTER TABLE "claim" DROP COLUMN "selfDisasterId"`);
        await queryRunner.query(`ALTER TABLE "claim" DROP COLUMN "femaDisasterId"`);
        await queryRunner.query(`ALTER TABLE "claim" ADD "disasterId" character varying NOT NULL`);
        await queryRunner.query(`DROP TABLE "self_declared_disaster"`);
        await queryRunner.query(`ALTER TABLE "claim" ADD CONSTRAINT "UQ_e15a58941d97f6bf90b4b69433c" UNIQUE ("companyId", "disasterId")`);
        await queryRunner.query(`ALTER TABLE "claim" ADD CONSTRAINT "FK_febac1e7fc933e9195b5f535e36" FOREIGN KEY ("disasterId") REFERENCES "fema_disaster"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

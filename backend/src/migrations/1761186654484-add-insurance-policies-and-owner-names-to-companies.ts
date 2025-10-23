import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInsurancePoliciesAndOwnerNamesToCompanies1761186654484 implements MigrationInterface {
    name = "AddInsurancePoliciesAndOwnerNamesToCompanies1761186654484";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "insurance_policy" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "policyHolderFirstName" character varying NOT NULL, "policyHolderLastName" character varying NOT NULL, "insuranceCompanyName" character varying NOT NULL, "policyNumber" character varying NOT NULL, "insuranceType" character varying NOT NULL, "companyId" uuid NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c4c50dbcf89b2b5c90e0cfda67d" PRIMARY KEY ("id"))`
        );
        await queryRunner.query(`ALTER TABLE "company" ADD "businessOwnerFullName" character varying NOT NULL`);
        await queryRunner.query(
            `ALTER TABLE "insurance_policy" ADD CONSTRAINT "FK_768b855027b51c8b7c1f7c393f6" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "insurance_policy" DROP CONSTRAINT "FK_768b855027b51c8b7c1f7c393f6"`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "businessOwnerFullName"`);
        await queryRunner.query(`DROP TABLE "insurance_policy"`);
    }
}

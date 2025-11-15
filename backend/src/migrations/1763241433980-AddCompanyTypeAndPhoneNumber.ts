import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCompanyTypeAndPhoneNumber1763241433980 implements MigrationInterface {
    name = 'AddCompanyTypeAndPhoneNumber1763241433980'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."company_companytype_enum" AS ENUM('LLC', 'Sole Proprietorship', 'Corporation', 'Partnership')`);
        await queryRunner.query(`ALTER TABLE "company" ADD "companyType" "public"."company_companytype_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD "phoneNumber" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "phoneNumber"`);
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "companyType"`);
        await queryRunner.query(`DROP TYPE "public"."company_companytype_enum"`);
    }

}

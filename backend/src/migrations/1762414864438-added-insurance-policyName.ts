import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedInsurancePolicyName1762414864438 implements MigrationInterface {
    name = 'AddedInsurancePolicyName1762414864438'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "insurance_policy" ADD "policyName" character varying(200) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "insurance_policy" ADD "policyName" character varying`);
    }

}

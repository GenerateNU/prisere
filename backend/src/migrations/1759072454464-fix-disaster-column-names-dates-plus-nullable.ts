import { MigrationInterface, QueryRunner } from "typeorm";

export class FixDisasterColumnNamesDatesPlusNullable1759072454464 implements MigrationInterface {
    name = "FixDisasterColumnNamesDatesPlusNullable1759072454464";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fema_disaster" RENAME COLUMN "femaId" TO "id"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" RENAME COLUMN "state" TO "fipsStateCode"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" RENAME COLUMN "startDate" TO "incidentBeginDate"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" RENAME COLUMN "endDate" TO "incidentEndDate"`);
        await queryRunner.query(
            `ALTER TABLE "fema_disaster" ALTER COLUMN "fipsStateCode" TYPE integer USING "fipsStateCode"::integer`
        );
        await queryRunner.query(`ALTER TABLE "fema_disaster" ALTER COLUMN "id" TYPE character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fema_disaster" RENAME COLUMN "id" TO "femaId"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" RENAME COLUMN "fipsStateCode" TO "state"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" RENAME COLUMN "incidentBeginDate" TO "startDate"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" RENAME COLUMN "incidentEndDate" TO "endDate"`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" ALTER COLUMN "id" TYPE integer USING "id"::integer`);
        await queryRunner.query(`ALTER TABLE "fema_disaster" ALTER COLUMN "fipsStateCode" TYPE character varying`);
    }
}

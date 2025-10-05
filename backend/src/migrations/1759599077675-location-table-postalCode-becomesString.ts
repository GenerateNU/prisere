import { MigrationInterface, QueryRunner } from "typeorm";

export class LocationTablePostalCodeBecomesString1759599077675 implements MigrationInterface {
    name = "LocationTablePostalCodeBecomesString1759599077675";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "location_address" ALTER COLUMN "postalCode" TYPE varchar USING "postalCode"::varchar`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "location_address" ALTER COLUMN "postalCode" TYPE integer USING "postalCode"::integer`
        );
    }
}

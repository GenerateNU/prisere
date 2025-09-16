import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedDisasterTableWithDisasterNumber1757968245351 implements MigrationInterface {
    name = 'AddedDisasterTableWithDisasterNumber1757968245351'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fema_disaster" ADD "disaster_number" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fema_disaster" DROP COLUMN "disaster_number"`);
    }

}

export class AddLocationAddresses1758197300543 {
    name = "AddLocationAddresses1758197300543";
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "location_address" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "country" character varying NOT NULL, "stateProvince" character varying NOT NULL, "city" character varying NOT NULL, "streetAddress" character varying NOT NULL, "postalCode" integer NOT NULL, "county" character varying, CONSTRAINT "PK_bf1188fd425a5c4f19d6fa22c2e" PRIMARY KEY ("id"))`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "location_address"`);
    }
}

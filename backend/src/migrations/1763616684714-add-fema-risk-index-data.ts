import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFemaRiskIndexData1763616684714 implements MigrationInterface {
    name = "AddFemaRiskIndexData1763616684714";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "county_fema_risk_data" ("countyFipsCode" character varying(5) NOT NULL, "riskRating" character varying(20) NOT NULL, "ealRating" character varying(20) NOT NULL, "socialVuln" character varying(20) NOT NULL, "communityResilience" character varying(20) NOT NULL, "coastalFlooding" character varying(20) NOT NULL, "drought" character varying(20) NOT NULL, "wildFire" character varying(20) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_448aaa477ad2d846fa079d6dd9c" PRIMARY KEY ("countyFipsCode"))`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "county_fema_risk_data"`);
    }
}

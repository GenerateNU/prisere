export class AddCompanyIdToUser1758514825971 {
    name = "AddCompanyIdToUser1758514825971";
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" ADD "companyId" uuid`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_86586021a26d1180b0968f98502" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_86586021a26d1180b0968f98502"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "companyId"`);
    }
}

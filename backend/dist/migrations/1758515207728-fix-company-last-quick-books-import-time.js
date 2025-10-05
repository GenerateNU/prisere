export class FixCompanyLastQuickBooksImportTime1758515207728 {
    name = "FixCompanyLastQuickBooksImportTime1758515207728";
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "lastQuickBooksImportTime"`);
        await queryRunner.query(`ALTER TABLE "company" ADD "lastQuickBooksImportTime" TIMESTAMP WITH TIME ZONE`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "company" DROP COLUMN "lastQuickBooksImportTime"`);
        await queryRunner.query(`ALTER TABLE "company" ADD "lastQuickBooksImportTime" TIMESTAMP`);
    }
}

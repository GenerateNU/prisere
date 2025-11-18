import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateLineItemTypeEnum1763247091860 implements MigrationInterface {
    name = 'UpdateLineItemTypeEnum1763247091860'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."purchase_line_item_type_enum" RENAME TO "purchase_line_item_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."purchase_line_item_type_enum" AS ENUM('extraneous', 'typical', 'pending', 'suggested extraneous', 'suggested typical')`);
        await queryRunner.query(`ALTER TABLE "purchase_line_item" ALTER COLUMN "type" TYPE "public"."purchase_line_item_type_enum" USING "type"::"text"::"public"."purchase_line_item_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."purchase_line_item_type_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."purchase_line_item_type_enum_old" AS ENUM('extraneous', 'typical')`);
        await queryRunner.query(`ALTER TABLE "purchase_line_item" ALTER COLUMN "type" TYPE "public"."purchase_line_item_type_enum_old" USING "type"::"text"::"public"."purchase_line_item_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."purchase_line_item_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."purchase_line_item_type_enum_old" RENAME TO "purchase_line_item_type_enum"`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class baseEntiryDeletedColumn1675713273429 implements MigrationInterface {
    name = 'baseEntiryDeletedColumn1675713273429'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bans" ALTER COLUMN "deleted" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "likes" ALTER COLUMN "deleted" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "likes" ALTER COLUMN "deleted" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bans" ALTER COLUMN "deleted" SET NOT NULL`);
    }

}

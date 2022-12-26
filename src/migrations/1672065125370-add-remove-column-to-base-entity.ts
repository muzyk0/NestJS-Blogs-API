import { MigrationInterface, QueryRunner } from 'typeorm';

export class addRemoveColumnToBaseEntity1672065125370
  implements MigrationInterface
{
  name = 'addRemoveColumnToBaseEntity1672065125370';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "likes"
            ADD "deleted" TIMESTAMP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "likes"
            DROP COLUMN "deleted"`);
  }
}

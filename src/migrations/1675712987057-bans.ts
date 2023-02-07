import { MigrationInterface, QueryRunner } from 'typeorm';

export class bans1675712987057 implements MigrationInterface {
  name = 'bans1675712987057';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."bans_type_enum" AS ENUM('0', '1')`,
    );
    await queryRunner.query(
      `CREATE TABLE "bans" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted" TIMESTAMP NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "parentId" character varying, "type" "public"."bans_type_enum" NOT NULL, "isBanned" boolean NOT NULL DEFAULT false, "banReason" character varying, CONSTRAINT "PK_a4d6f261bffa4615c62d756566a" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "bans"`);
    await queryRunner.query(`DROP TYPE "public"."bans_type_enum"`);
  }
}

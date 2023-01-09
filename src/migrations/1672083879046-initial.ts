import { MigrationInterface, QueryRunner } from 'typeorm';

export class initial1672083879046 implements MigrationInterface {
  name = 'initial1672083879046';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."likes_parenttype_enum" AS ENUM('1', '2')`,
    );
    await queryRunner.query(
      `CREATE TABLE "likes" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deleted" TIMESTAMP NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "parentId" character varying NOT NULL, "parentType" "public"."likes_parenttype_enum" NOT NULL, "status" integer NOT NULL, CONSTRAINT "PK_a9323de3f8bced7539a794b4a37" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "likes"`);
    await queryRunner.query(`DROP TYPE "public"."likes_parenttype_enum"`);
  }
}

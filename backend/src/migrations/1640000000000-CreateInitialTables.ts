import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialTables1640000000000 implements MigrationInterface {
    name = 'CreateInitialTables1640000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "username" character varying NOT NULL,
                "email" character varying NOT NULL,
                "password_hash" character varying NOT NULL,
                "avatar_url" character varying,
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"),
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "conversations" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying,
                "is_group" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_ee34f001f89c1d725afd1c0f7dc" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "participants" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "conversation_id" uuid NOT NULL,
                "joined_at" TIMESTAMP NOT NULL DEFAULT now(),
                "is_admin" boolean NOT NULL DEFAULT false,
                CONSTRAINT "PK_1cda06c31eec1c95b3365a0283f" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TYPE "public"."messages_type_enum" AS ENUM('text', 'image', 'file', 'system')
        `);

        await queryRunner.query(`
            CREATE TABLE "messages" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "content" character varying NOT NULL,
                "type" "public"."messages_type_enum" NOT NULL DEFAULT 'text',
                "is_edited" boolean NOT NULL DEFAULT false,
                "edited_at" TIMESTAMP,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "conversation_id" uuid NOT NULL,
                "sender_id" uuid NOT NULL,
                CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "participants" ADD CONSTRAINT "FK_participants_user" 
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "participants" ADD CONSTRAINT "FK_participants_conversation" 
            FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "messages" ADD CONSTRAINT "FK_messages_conversation" 
            FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "messages" ADD CONSTRAINT "FK_messages_sender" 
            FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        // Create indexes for better performance
        await queryRunner.query(`CREATE INDEX "IDX_messages_conversation" ON "messages" ("conversation_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_messages_created_at" ON "messages" ("created_at")`);
        await queryRunner.query(`CREATE INDEX "IDX_participants_conversation" ON "participants" ("conversation_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_participants_user" ON "participants" ("user_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_participants_user"`);
        await queryRunner.query(`DROP INDEX "IDX_participants_conversation"`);
        await queryRunner.query(`DROP INDEX "IDX_messages_created_at"`);
        await queryRunner.query(`DROP INDEX "IDX_messages_conversation"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_messages_sender"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_messages_conversation"`);
        await queryRunner.query(`ALTER TABLE "participants" DROP CONSTRAINT "FK_participants_conversation"`);
        await queryRunner.query(`ALTER TABLE "participants" DROP CONSTRAINT "FK_participants_user"`);
        await queryRunner.query(`DROP TABLE "messages"`);
        await queryRunner.query(`DROP TYPE "public"."messages_type_enum"`);
        await queryRunner.query(`DROP TABLE "participants"`);
        await queryRunner.query(`DROP TABLE "conversations"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }
}
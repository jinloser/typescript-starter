import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserAvatarToUsers1794900188286 implements MigrationInterface {
    name = 'AddUserAvatarToUsers1794900188286'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`avatar\` varchar(255) NOT NULL COMMENT '头像URL' DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`avatar\``);
    }

}

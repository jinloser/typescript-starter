import { MigrationInterface, QueryRunner } from "typeorm";

export class SyncSchemaWithEntities20261117143300 implements MigrationInterface {
    name = 'SyncSchemaWithEntities20261117143300'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`role_menus\` DROP FOREIGN KEY \`FK_role_menus_menu\``);
        await queryRunner.query(`ALTER TABLE \`role_menus\` DROP FOREIGN KEY \`FK_role_menus_role\``);
        await queryRunner.query(`ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_user_roles_role\``);
        await queryRunner.query(`ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_user_roles_user\``);
        await queryRunner.query(`DROP INDEX \`IDX_8c9c9b6e9e9a4b5d4c5e6f7a8b\` ON \`roles\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`ALTER TABLE \`menus\` CHANGE \`parent_id\` \`parent_id\` int NOT NULL COMMENT '父菜单ID，0为根' DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE \`menus\` CHANGE \`type\` \`type\` varchar(20) NOT NULL COMMENT 'dir|menu|button'`);
        await queryRunner.query(`ALTER TABLE \`menus\` CHANGE \`status\` \`status\` tinyint NOT NULL COMMENT '1 启用 0 禁用' DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`roles\` ADD UNIQUE INDEX \`IDX_f6d54f95c31b73fb1bdd8e91d0\` (\`code\`)`);
        await queryRunner.query(`ALTER TABLE \`roles\` CHANGE \`status\` \`status\` tinyint NOT NULL COMMENT '1 启用 0 禁用' DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD UNIQUE INDEX \`IDX_fe0bb3f6520ee0469504521e71\` (\`username\`)`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`status\` \`status\` tinyint NOT NULL COMMENT '1 启用 0 禁用' DEFAULT '1'`);
        await queryRunner.query(`CREATE INDEX \`IDX_cec0c62317111ac45c9c295d22\` ON \`role_menus\` (\`role_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_4c7c7bd4eb8a33aece58434cbf\` ON \`role_menus\` (\`menu_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_87b8888186ca9769c960e92687\` ON \`user_roles\` (\`user_id\`)`);
        await queryRunner.query(`CREATE INDEX \`IDX_b23c65e50a758245a33ee35fda\` ON \`user_roles\` (\`role_id\`)`);
        await queryRunner.query(`ALTER TABLE \`role_menus\` ADD CONSTRAINT \`FK_cec0c62317111ac45c9c295d226\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`role_menus\` ADD CONSTRAINT \`FK_4c7c7bd4eb8a33aece58434cbf5\` FOREIGN KEY (\`menu_id\`) REFERENCES \`menus\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_87b8888186ca9769c960e926870\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_b23c65e50a758245a33ee35fda1\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_b23c65e50a758245a33ee35fda1\``);
        await queryRunner.query(`ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_87b8888186ca9769c960e926870\``);
        await queryRunner.query(`ALTER TABLE \`role_menus\` DROP FOREIGN KEY \`FK_4c7c7bd4eb8a33aece58434cbf5\``);
        await queryRunner.query(`ALTER TABLE \`role_menus\` DROP FOREIGN KEY \`FK_cec0c62317111ac45c9c295d226\``);
        await queryRunner.query(`DROP INDEX \`IDX_b23c65e50a758245a33ee35fda\` ON \`user_roles\``);
        await queryRunner.query(`DROP INDEX \`IDX_87b8888186ca9769c960e92687\` ON \`user_roles\``);
        await queryRunner.query(`DROP INDEX \`IDX_4c7c7bd4eb8a33aece58434cbf\` ON \`role_menus\``);
        await queryRunner.query(`DROP INDEX \`IDX_cec0c62317111ac45c9c295d22\` ON \`role_menus\``);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`status\` \`status\` tinyint NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP INDEX \`IDX_fe0bb3f6520ee0469504521e71\``);
        await queryRunner.query(`ALTER TABLE \`roles\` CHANGE \`status\` \`status\` tinyint NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`roles\` DROP INDEX \`IDX_f6d54f95c31b73fb1bdd8e91d0\``);
        await queryRunner.query(`ALTER TABLE \`menus\` CHANGE \`status\` \`status\` tinyint NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE \`menus\` CHANGE \`type\` \`type\` varchar(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`menus\` CHANGE \`parent_id\` \`parent_id\` int NOT NULL DEFAULT '0'`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\` (\`username\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_8c9c9b6e9e9a4b5d4c5e6f7a8b\` ON \`roles\` (\`code\`)`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_user_roles_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE RESTRICT`);
        await queryRunner.query(`ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_user_roles_role\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE RESTRICT`);
        await queryRunner.query(`ALTER TABLE \`role_menus\` ADD CONSTRAINT \`FK_role_menus_role\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE RESTRICT`);
        await queryRunner.query(`ALTER TABLE \`role_menus\` ADD CONSTRAINT \`FK_role_menus_menu\` FOREIGN KEY (\`menu_id\`) REFERENCES \`menus\`(\`id\`) ON DELETE CASCADE ON UPDATE RESTRICT`);
    }

}

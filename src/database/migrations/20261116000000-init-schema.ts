import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 初始建表迁移。
 * 使用 IF NOT EXISTS 保证幂等：
 * - 全新数据库：自动创建 5 张表
 * - 已有旧库（此前由 synchronize 建表）：跳过已存在的表，不破坏现有数据
 * 后续结构变更请新增迁移文件，勿修改本文件。
 */
export class InitSchema20261116000000 implements MigrationInterface {
  name = 'InitSchema20261116000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`username\` varchar(50) NOT NULL,
        \`password\` varchar(100) NOT NULL,
        \`nickname\` varchar(50) NOT NULL DEFAULT '',
        \`email\` varchar(100) NULL DEFAULT '',
        \`phone\` varchar(20) NULL DEFAULT '',
        \`status\` tinyint NOT NULL DEFAULT 1,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`username\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`roles\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(50) NOT NULL,
        \`code\` varchar(50) NOT NULL,
        \`description\` varchar(200) NOT NULL DEFAULT '',
        \`status\` tinyint NOT NULL DEFAULT 1,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`IDX_8c9c9b6e9e9a4b5d4c5e6f7a8b\` (\`code\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`menus\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`parent_id\` int NOT NULL DEFAULT 0,
        \`name\` varchar(50) NOT NULL,
        \`type\` varchar(20) NOT NULL,
        \`path\` varchar(200) NOT NULL DEFAULT '',
        \`component\` varchar(200) NOT NULL DEFAULT '',
        \`permission\` varchar(100) NOT NULL DEFAULT '',
        \`icon\` varchar(50) NOT NULL DEFAULT '',
        \`sort\` int NOT NULL DEFAULT 0,
        \`status\` tinyint NOT NULL DEFAULT 1,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`user_roles\` (
        \`user_id\` int NOT NULL,
        \`role_id\` int NOT NULL,
        PRIMARY KEY (\`user_id\`, \`role_id\`),
        CONSTRAINT \`FK_user_roles_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT \`FK_user_roles_role\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`role_menus\` (
        \`role_id\` int NOT NULL,
        \`menu_id\` int NOT NULL,
        PRIMARY KEY (\`role_id\`, \`menu_id\`),
        CONSTRAINT \`FK_role_menus_role\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT \`FK_role_menus_menu\` FOREIGN KEY (\`menu_id\`) REFERENCES \`menus\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`role_menus\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`user_roles\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`menus\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`roles\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`users\``);
  }
}

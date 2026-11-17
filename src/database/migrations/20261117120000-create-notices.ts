import {
  MigrationInterface,
  QueryRunner,
} from 'typeorm';

export class CreateNotices20261117120000 implements MigrationInterface {
  name = 'CreateNotices20261117120000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`notices\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`title\` varchar(200) NOT NULL COMMENT '公告标题',
        \`content\` text NOT NULL COMMENT '公告内容',
        \`status\` tinyint NOT NULL DEFAULT 1 COMMENT '1 启用 0 禁用',
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`notices\``);
  }
}

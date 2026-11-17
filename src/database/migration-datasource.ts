import 'dotenv/config';

import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { Role } from '../roles/entities/role.entity.js';
import { Menu } from '../menus/entities/menu.entity.js';
import { Notice } from '../notices/entities/notice.entity.js';

/**
 * 仅供 TypeORM CLI 使用的独立数据源（migration:generate / run / revert）。
 * 与 app.module.ts 的 TypeOrmModule.forRootAsync 保持同步；
 * 不注册进 Nest 运行时。
 */
export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USERNAME ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_DATABASE ?? 'admin_system',
  charset: 'utf8mb4',
  entities: [User, Role, Menu, Notice],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});

import { Module } from '@nestjs/common';
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { createObserveModule } from '@nestjs/observe';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { PermissionsGuard } from './common/guards/permissions.guard.js';
import { UploadController } from './common/upload.controller.js';
import {
  AddUserAvatarToUsers1794900188286,
} from './database/migrations/1794900188286-AddUserAvatarToUsers.js';
import {
  InitSchema20261116000000,
} from './database/migrations/20261116000000-init-schema.js';
import {
  CreateNotices20261117120000,
} from './database/migrations/20261117120000-create-notices.js';
import {
  SyncSchemaWithEntities20261117143300,
} from './database/migrations/20261117143300-sync-schema-with-entities.js';
import {
  DropLeftoverFkIndexes20261117144000,
} from './database/migrations/20261117144000-drop-leftover-fk-indexes.js';
import { SeedService } from './database/seed.service.js';
import { Menu } from './menus/entities/menu.entity.js';
import { MenusModule } from './menus/menus.module.js';
import { Notice } from './notices/entities/notice.entity.js';
import { NoticesModule } from './notices/notices.module.js';
import { Role } from './roles/entities/role.entity.js';
import { RolesModule } from './roles/roles.module.js';
import { User } from './users/entities/user.entity.js';
import { UsersModule } from './users/users.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', '127.0.0.1'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USERNAME', 'root'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_DATABASE', 'admin_system'),
        entities: [User, Role, Menu, Notice],
        // 生产环境关闭 synchronize，改用 migration 管理表结构
        synchronize: false,
        migrations: [InitSchema20261116000000, CreateNotices20261117120000, SyncSchemaWithEntities20261117143300, DropLeftoverFkIndexes20261117144000, AddUserAvatarToUsers1794900188286],
        migrationsRun: true,
        charset: 'utf8mb4',
      }),
    }),
    // 登录接口限流（默认 60 秒 10 次，login 接口单独收紧为 5 次）
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    JwtModule.register({}),
    AuthModule,
    UsersModule,
    RolesModule,
    MenusModule,
    NoticesModule,
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? '',
      appSecret: process.env.OBSERVE_APP_SECRET ?? '',
      runtimeMetrics: !Boolean(process.versions?.['webcontainer']),
      serviceId: 'nest-typescript-starter',
    }),
  ],
  controllers: [UploadController],
  providers: [
    SeedService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}

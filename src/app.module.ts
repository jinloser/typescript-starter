import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { createObserveModule } from '@nestjs/observe';
import { User } from './users/entities/user.entity.js';
import { Role } from './roles/entities/role.entity.js';
import { Menu } from './menus/entities/menu.entity.js';
import { InitSchema20261116000000 } from './database/migrations/20261116000000-init-schema.js';
import { SeedService } from './database/seed.service.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { RolesModule } from './roles/roles.module.js';
import { MenusModule } from './menus/menus.module.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { PermissionsGuard } from './common/guards/permissions.guard.js';

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
        entities: [User, Role, Menu],
        // 生产环境关闭 synchronize，改用 migration 管理表结构
        synchronize: false,
        migrations: [InitSchema20261116000000],
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
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? '',
      appSecret: process.env.OBSERVE_APP_SECRET ?? '',
      runtimeMetrics: !Boolean(process.versions?.['webcontainer']),
      serviceId: 'nest-typescript-starter',
    }),
  ],
  providers: [
    SeedService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}

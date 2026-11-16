import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { REQUIRE_PERMISSIONS_KEY } from '../decorators/require-permissions.decorator.js';
import { User } from '../../users/entities/user.entity.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const required = this.reflector.getAllAndOverride<string[]>(
      REQUIRE_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { id: number };
    if (!user) {
      throw new UnauthorizedException();
    }

    const userEntity = await this.dataSource.getRepository(User).findOne({
      where: { id: user.id },
      relations: { roles: { menus: true } },
    });
    if (!userEntity) {
      throw new UnauthorizedException();
    }

    const roleCodes = userEntity.roles.map((r) => r.code);
    if (roleCodes.includes('super_admin')) {
      return true;
    }

    const owned = new Set<string>();
    for (const role of userEntity.roles) {
      for (const menu of role.menus) {
        if (menu.permission) {
          owned.add(menu.permission);
        }
      }
    }

    if (required.some((p) => owned.has(p))) {
      return true;
    }
    throw new ForbiddenException('没有操作权限');
  }
}

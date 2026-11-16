import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity.js';
import { Menu } from '../menus/entities/menu.entity.js';
import { LoginDto } from './dto/login.dto.js';

export interface MenuNode {
  id: number;
  parentId: number;
  name: string;
  type: string;
  path: string;
  component: string;
  permission: string;
  icon: string;
  sort: number;
  status: number;
  children?: MenuNode[];
}

export interface AuthProfile {
  id: number;
  username: string;
  nickname: string;
  email: string | null;
  phone: string | null;
  status: number;
  roles: string[];
  permissions: string[];
  menus: MenuNode[];
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<{ accessToken: string; userInfo: AuthProfile }> {
    const user = await this.userRepo.findOne({
      where: { username: dto.username },
      select: ['id', 'username', 'password', 'nickname', 'email', 'phone', 'status'],
      relations: { roles: { menus: true } },
    });
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    if (user.status !== 1) {
      throw new ForbiddenException('账号已被禁用');
    }
    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, username: user.username },
      {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: this.config.get<string>('JWT_EXPIRES_IN', '2h') as unknown as number,
      },
    );
    return { accessToken, userInfo: this.buildProfile(user) };
  }

  async profile(userId: number): Promise<AuthProfile> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: { roles: { menus: true } },
    });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    return this.buildProfile(user);
  }

  private buildProfile(user: User): AuthProfile {
    const roles = user.roles.map((r) => r.code);
    const permissions = new Set<string>();
    const menuMap = new Map<number, MenuNode>();
    for (const role of user.roles) {
      for (const menu of role.menus) {
        if (menu.permission) {
          permissions.add(menu.permission);
        }
        menuMap.set(menu.id, this.toMenuNode(menu));
      }
    }
    const menus = this.buildMenuTree(menuMap);
    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      phone: user.phone,
      status: user.status,
      roles,
      permissions: [...permissions],
      menus,
    };
  }

  private toMenuNode(menu: Menu): MenuNode {
    return {
      id: menu.id,
      parentId: menu.parentId,
      name: menu.name,
      type: menu.type,
      path: menu.path,
      component: menu.component,
      permission: menu.permission,
      icon: menu.icon,
      sort: menu.sort,
      status: menu.status,
      children: [],
    };
  }

  private buildMenuTree(nodes: Map<number, MenuNode>): MenuNode[] {
    const roots: MenuNode[] = [];
    for (const node of nodes.values()) {
      if (node.parentId === 0) {
        roots.push(node);
      } else {
        const parent = nodes.get(node.parentId);
        if (parent) {
          parent.children = parent.children ?? [];
          parent.children.push(node);
        }
      }
    }
    const sortRec = (list: MenuNode[]) => {
      list.sort((a, b) => a.sort - b.sort);
      for (const n of list) {
        if (n.children && n.children.length > 0) {
          sortRec(n.children);
        }
      }
    };
    sortRec(roots);
    return roots;
  }
}

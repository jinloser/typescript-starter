import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity.js';
import { Role } from '../roles/entities/role.entity.js';
import { Menu } from '../menus/entities/menu.entity.js';
import { flattenMenus, seedMenus, seedRoles, seedUsers } from './seed-data.js';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    await this.seed();
  }

  /** 分步幂等种子：菜单/角色/用户各自为空才写入 */
  async seed(): Promise<void> {
    const userRepo = this.dataSource.getRepository(User);
    const roleRepo = this.dataSource.getRepository(Role);
    const menuRepo = this.dataSource.getRepository(Menu);

    const userCount = await userRepo.count();
    const roleCount = await roleRepo.count();
    const menuCount = await menuRepo.count();

    // 1. 菜单（为空才写入；id 自增，先入库再修正 parentId）
    if (menuCount === 0) {
      const flat = flattenMenus(seedMenus);
      const idMap = new Map<number, number>();
      for (const m of flat) {
        const saved = await menuRepo.save(
          menuRepo.create({
            parentId: m.parentId,
            name: m.name,
            type: m.type,
            path: m.path,
            component: m.component,
            permission: m.permission,
            icon: m.icon,
            sort: m.sort,
            status: m.status,
          }),
        );
        idMap.set(m.id, saved.id);
      }
      for (const m of flat) {
        const newId = idMap.get(m.id);
        const newParentId = m.parentId === 0 ? 0 : (idMap.get(m.parentId) ?? 0);
        if (newId) {
          await menuRepo.update(newId, { parentId: newParentId });
        }
      }
      this.logger.log(`已写入 ${flat.length} 条菜单`);
    }

    // 2. 角色（为空才写入）
    const roleMap = new Map<string, Role>();
    if (roleCount === 0) {
      for (const r of seedRoles) {
        const saved = await roleRepo.save(roleRepo.create(r));
        roleMap.set(saved.code, saved);
      }
      this.logger.log(`已写入 ${seedRoles.length} 个角色`);
    } else {
      const existing = await roleRepo.find();
      for (const r of existing) {
        roleMap.set(r.code, r);
      }
    }

    // 3. 角色-菜单关联（菜单或角色为空时重建）
    if (menuCount === 0 || roleCount === 0) {
      const allMenus = await menuRepo.find();
      const superAdmin = roleMap.get('super_admin');
      if (superAdmin) {
        superAdmin.menus = allMenus;
        await roleRepo.save(superAdmin);
      }
      const normalAdmin = roleMap.get('admin');
      if (normalAdmin) {
        const systemRoot = allMenus.find((m) => m.name === '系统管理' && m.type === 'dir');
        if (systemRoot) {
          const subTree = allMenus.filter(
            (m) => m.id === systemRoot.id || m.parentId === systemRoot.id || this.isDescendant(m, systemRoot.id, allMenus),
          );
          normalAdmin.menus = subTree;
          await roleRepo.save(normalAdmin);
        }
      }
    }

    // 4. 用户（为空才写入）
    if (userCount === 0) {
      for (const u of seedUsers) {
        const hash = await bcrypt.hash(u.password, 10);
        await userRepo.save(
          userRepo.create({
            username: u.username,
            password: hash,
            nickname: u.nickname,
            email: u.email,
            phone: u.phone,
            status: u.status,
            roles: u.roleCodes.map((c) => roleMap.get(c)).filter((r): r is Role => Boolean(r)),
          }),
        );
      }
      this.logger.log(`已写入 ${seedUsers.length} 个用户（admin/admin123）`);
    }
  }

  private isDescendant(menu: Menu, rootId: number, all: Menu[]): boolean {
    if (menu.parentId === rootId) {
      return true;
    }
    const parent = all.find((m) => m.id === menu.parentId);
    return parent ? this.isDescendant(parent, rootId, all) : false;
  }
}

import type { Menu } from '../menus/entities/menu.entity.js';

/**
 * 菜单树种子数据。id 仅为构建父子关系用，入库时由数据库自增。
 */
export interface SeedMenu {
  id: number;
  parentId: number;
  name: string;
  type: 'dir' | 'menu' | 'button';
  path: string;
  component: string;
  permission: string;
  icon: string;
  sort: number;
  status: number;
  children?: SeedMenu[];
}

export const seedMenus: SeedMenu[] = [
  {
    id: 1,
    parentId: 0,
    name: '首页',
    type: 'menu',
    path: '/dashboard',
    component: 'dashboard/index',
    permission: '',
    icon: 'HomeFilled',
    sort: 1,
    status: 1,
  },
  {
    id: 2,
    parentId: 0,
    name: '系统管理',
    type: 'dir',
    path: '/system',
    component: '',
    permission: '',
    icon: 'Setting',
    sort: 2,
    status: 1,
    children: [
      {
        id: 20,
        parentId: 2,
        name: '用户管理',
        type: 'menu',
        path: '/system/user',
        component: 'system/user/index',
        permission: '',
        icon: 'User',
        sort: 1,
        status: 1,
        children: [
          { id: 2001, parentId: 20, name: '查询用户', type: 'button', path: '', component: '', permission: 'sys:user:query', icon: '', sort: 1, status: 1 },
          { id: 2002, parentId: 20, name: '新增用户', type: 'button', path: '', component: '', permission: 'sys:user:add', icon: '', sort: 2, status: 1 },
          { id: 2003, parentId: 20, name: '编辑用户', type: 'button', path: '', component: '', permission: 'sys:user:edit', icon: '', sort: 3, status: 1 },
          { id: 2004, parentId: 20, name: '删除用户', type: 'button', path: '', component: '', permission: 'sys:user:delete', icon: '', sort: 4, status: 1 },
          { id: 2005, parentId: 20, name: '分配角色', type: 'button', path: '', component: '', permission: 'sys:user:assign', icon: '', sort: 5, status: 1 },
        ],
      },
      {
        id: 21,
        parentId: 2,
        name: '角色管理',
        type: 'menu',
        path: '/system/role',
        component: 'system/role/index',
        permission: '',
        icon: 'Avatar',
        sort: 2,
        status: 1,
        children: [
          { id: 2101, parentId: 21, name: '查询角色', type: 'button', path: '', component: '', permission: 'sys:role:query', icon: '', sort: 1, status: 1 },
          { id: 2102, parentId: 21, name: '新增角色', type: 'button', path: '', component: '', permission: 'sys:role:add', icon: '', sort: 2, status: 1 },
          { id: 2103, parentId: 21, name: '编辑角色', type: 'button', path: '', component: '', permission: 'sys:role:edit', icon: '', sort: 3, status: 1 },
          { id: 2104, parentId: 21, name: '删除角色', type: 'button', path: '', component: '', permission: 'sys:role:delete', icon: '', sort: 4, status: 1 },
          { id: 2105, parentId: 21, name: '分配权限', type: 'button', path: '', component: '', permission: 'sys:role:assign', icon: '', sort: 5, status: 1 },
        ],
      },
      {
        id: 22,
        parentId: 2,
        name: '菜单管理',
        type: 'menu',
        path: '/system/menu',
        component: 'system/menu/index',
        permission: '',
        icon: 'Menu',
        sort: 3,
        status: 1,
        children: [
          { id: 2201, parentId: 22, name: '查询菜单', type: 'button', path: '', component: '', permission: 'sys:menu:query', icon: '', sort: 1, status: 1 },
          { id: 2202, parentId: 22, name: '新增菜单', type: 'button', path: '', component: '', permission: 'sys:menu:add', icon: '', sort: 2, status: 1 },
          { id: 2203, parentId: 22, name: '编辑菜单', type: 'button', path: '', component: '', permission: 'sys:menu:edit', icon: '', sort: 3, status: 1 },
          { id: 2204, parentId: 22, name: '删除菜单', type: 'button', path: '', component: '', permission: 'sys:menu:delete', icon: '', sort: 4, status: 1 },
        ],
      },
    ],
  },
];

export const seedRoles = [
  {
    name: '超级管理员',
    code: 'super_admin',
    description: '系统内置超级管理员，拥有全部权限',
    status: 1,
  },
  {
    name: '普通管理员',
    code: 'admin',
    description: '普通管理员，拥有系统管理功能权限',
    status: 1,
  },
];

export interface SeedUser {
  username: string;
  password: string;
  nickname: string;
  email?: string;
  phone?: string;
  status: number;
  roleCodes: string[];
}

export const seedUsers: SeedUser[] = [
  {
    username: 'admin',
    password: 'admin123',
    nickname: '超级管理员',
    email: 'admin@example.com',
    phone: '13800000000',
    status: 1,
    roleCodes: ['super_admin'],
  },
];

/** 扁平化菜单，便于入库后重建父子关联 */
export function flattenMenus(list: SeedMenu[], parentId = 0, output: SeedMenu[] = []): SeedMenu[] {
  for (const m of list) {
    const children = m.children ?? [];
    const { children: _ignored, ...rest } = m;
    output.push({ ...rest, parentId });
    if (children.length > 0) {
      flattenMenus(children, m.id, output);
    }
  }
  return output;
}

export type MenuRelation = Pick<Menu, 'id' | 'parentId'>;

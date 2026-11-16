import request from './request';
import type { MenuNode } from './auth';

export interface MenuForm {
  parentId?: number;
  name: string;
  type: 'dir' | 'menu' | 'button';
  path?: string;
  component?: string;
  permission?: string;
  icon?: string;
  sort?: number;
  status?: number;
}

export function getMenuTree() {
  return request.get<MenuNode[], MenuNode[]>('/menus/tree');
}

export function createMenu(data: MenuForm) {
  return request.post<MenuNode, MenuNode>('/menus', data);
}

export function updateMenu(id: number, data: Partial<MenuForm>) {
  return request.patch<MenuNode, MenuNode>(`/menus/${id}`, data);
}

export function deleteMenu(id: number) {
  return request.delete<{ success: boolean }, { success: boolean }>(`/menus/${id}`);
}

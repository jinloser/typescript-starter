import request from './request';
import type { PageResult } from './user';

export interface RoleItem {
  id: number;
  name: string;
  code: string;
  description: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  menus?: { id: number; name: string }[];
}

export interface RoleForm {
  name: string;
  code: string;
  description?: string;
  status?: number;
}

export function getRoles(params: { keyword?: string; page?: number; pageSize?: number }) {
  return request.get<PageResult<RoleItem>, PageResult<RoleItem>>('/roles', { params });
}

export function getRoleOptions() {
  return request.get<RoleItem[], RoleItem[]>('/roles/options');
}

export function getRole(id: number) {
  return request.get<RoleItem, RoleItem>(`/roles/${id}`);
}

export function createRole(data: RoleForm) {
  return request.post<RoleItem, RoleItem>('/roles', data);
}

export function updateRole(id: number, data: Partial<RoleForm>) {
  return request.patch<RoleItem, RoleItem>(`/roles/${id}`, data);
}

export function deleteRole(id: number) {
  return request.delete<{ success: boolean }, { success: boolean }>(`/roles/${id}`);
}

export function assignRoleMenus(id: number, menuIds: number[]) {
  return request.put<RoleItem, RoleItem>(`/roles/${id}/menus`, { menuIds });
}

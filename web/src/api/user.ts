import request from './request';

export interface RoleBrief {
  id: number;
  name: string;
  code: string;
}

export interface UserItem {
  id: number;
  username: string;
  nickname: string;
  email: string | null;
  phone: string | null;
  status: number;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
  roles: RoleBrief[];
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UserQuery {
  keyword?: string;
  page?: number;
  pageSize?: number;
}

export interface UserForm {
  username: string;
  password?: string;
  nickname?: string;
  email?: string;
  phone?: string;
  status?: number;
  avatar?: string;
}

export function getUsers(params: UserQuery) {
  return request.get<PageResult<UserItem>, PageResult<UserItem>>('/users', { params });
}

export function getUser(id: number) {
  return request.get<UserItem, UserItem>(`/users/${id}`);
}

export function createUser(data: UserForm) {
  return request.post<UserItem, UserItem>('/users', data);
}

export function updateUser(id: number, data: UserForm) {
  return request.patch<UserItem, UserItem>(`/users/${id}`, data);
}

export function deleteUser(id: number) {
  return request.delete<{ success: boolean }, { success: boolean }>(`/users/${id}`);
}

export function assignUserRoles(id: number, roleIds: number[]) {
  return request.put<UserItem, UserItem>(`/users/${id}/roles`, { roleIds });
}

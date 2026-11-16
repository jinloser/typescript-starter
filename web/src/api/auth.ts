import request from './request';

export interface MenuNode {
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

export interface LoginResult {
  accessToken: string;
  userInfo: AuthProfile;
}

export function login(data: { username: string; password: string }) {
  return request.post<LoginResult, LoginResult>('/auth/login', data);
}

export function getProfile() {
  return request.get<AuthProfile, AuthProfile>('/auth/profile');
}

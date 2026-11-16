import { defineStore } from 'pinia';
import { login as apiLogin, getProfile, type AuthProfile } from '../api/auth';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('admin_token') || '',
    userInfo: JSON.parse(localStorage.getItem('admin_userinfo') || 'null') as AuthProfile | null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    nickname: (state) => state.userInfo?.nickname || state.userInfo?.username || '',
    roles: (state) => state.userInfo?.roles ?? [],
    permissions: (state) => state.userInfo?.permissions ?? [],
    menus: (state) => state.userInfo?.menus ?? [],
  },
  actions: {
    async login(payload: { username: string; password: string }) {
      const data = await apiLogin(payload);
      this.token = data.accessToken;
      this.userInfo = data.userInfo;
      localStorage.setItem('admin_token', data.accessToken);
      localStorage.setItem('admin_userinfo', JSON.stringify(data.userInfo));
    },
    async fetchProfile() {
      const info = await getProfile();
      this.userInfo = info;
      localStorage.setItem('admin_userinfo', JSON.stringify(info));
    },
    hasPermission(permission: string) {
      if (!permission) return true;
      if (this.roles.includes('super_admin')) return true;
      return this.permissions.includes(permission);
    },
    logout() {
      this.token = '';
      this.userInfo = null;
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_userinfo');
    },
  },
});

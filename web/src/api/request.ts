import axios from 'axios';
import { ElMessage } from 'element-plus';

const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

function getErrorMessage(error: unknown): string {
  const data = (error as any)?.response?.data as { msg?: string } | undefined;
  return data?.msg || (error as any)?.message || '请求失败';
}

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

request.interceptors.response.use(
  (response) => {
    const res = response.data;
    // 统一响应格式 {code, data, msg}：code === 0 表示成功
    if (res && typeof res === 'object' && 'code' in res && res.code !== 0) {
      ElMessage.error(res.msg || '请求失败');
      return Promise.reject(new Error(res.msg || '请求失败'));
    }
    return res && typeof res === 'object' && 'data' in res ? res.data : res;
  },
  (error) => {
    const status = error?.response?.status as number | undefined;
    const isLoginRequest = String(error?.config?.url ?? '').includes('/auth/login');
    if (status === 401 && isLoginRequest) {
      ElMessage.error(getErrorMessage(error));
    } else if (status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_userinfo');
      if (!window.location.hash.includes('/login')) {
        window.location.hash = '#/login';
      }
      ElMessage.error('登录已过期，请重新登录');
    } else {
      ElMessage.error(getErrorMessage(error));
    }
    return Promise.reject(error);
  },
);

export default request;

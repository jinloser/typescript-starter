import request from './request';
import type { PageResult } from './user';

export interface NoticeItem {
  id: number;
  title: string;
  content: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeForm {
  title: string;
  content: string;
  status?: number;
}

export function getNotices(params: { keyword?: string; page?: number; pageSize?: number }) {
  return request.get<PageResult<NoticeItem>, PageResult<NoticeItem>>('/notices', { params });
}

export function getNotice(id: number) {
  return request.get<NoticeItem, NoticeItem>(`/notices/${id}`);
}

export function createNotice(data: NoticeForm) {
  return request.post<NoticeItem, NoticeItem>('/notices', data);
}

export function updateNotice(id: number, data: Partial<NoticeForm>) {
  return request.patch<NoticeItem, NoticeItem>(`/notices/${id}`, data);
}

export function deleteNotice(id: number) {
  return request.delete<{ success: boolean }, { success: boolean }>(`/notices/${id}`);
}

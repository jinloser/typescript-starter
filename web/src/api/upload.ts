import request from './request';

export interface UploadResult {
  url: string;
}

export function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return request.post<UploadResult, UploadResult>('/upload', formData);
}

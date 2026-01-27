/**
 * 文件上传服务
 */
import request from '@/utils/http/index';
import type { ApiResponse } from './product/types';

/**
 * 上传单个文件
 */
export async function uploadFile(file: File): Promise<ApiResponse<string>> {
  const formData = new FormData();
  formData.append('file', file);

  return request({
    url: '/public/file/upload',
    method: 'POST',
    data: formData,
  });
}

/**
 * 批量上传文件
 */
export async function batchUploadFiles(files: File[]): Promise<ApiResponse<string[]>> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  return request({
    url: '/public/file/batchUpload',
    method: 'POST',
    data: formData,
  });
}

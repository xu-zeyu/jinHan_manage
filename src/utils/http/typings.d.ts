import type { ApiResponse } from '@/services/product/types';

declare module '@/utils/http/index' {
  const service: {
    <T = any>(config: any): Promise<ApiResponse<T>>;
    get: <T = any>(url: string, config?: any) => Promise<ApiResponse<T>>;
    post: <T = any>(url: string, data?: any, config?: any) => Promise<ApiResponse<T>>;
    put: <T = any>(url: string, data?: any, config?: any) => Promise<ApiResponse<T>>;
    delete: <T = any>(url: string, config?: any) => Promise<ApiResponse<T>>;
  };

  export const silent: typeof service;
  export const paramsSerializer: (params: any) => string;
  export const commonModelErrorHandler: (e: any) => void;

  export default service;
}

/**
 * 待办 API 服务
 */
import request from '@/utils/http/index';
import type {
  TodoVO,
  TodoPageParams,
  PageResult,
  ApiResponse,
} from './types';

export async function getTodoPage(params: TodoPageParams): Promise<ApiResponse<PageResult<TodoVO>>> {
  return request({
    url: '/todo/page',
    method: 'GET',
    params,
  });
}

export async function getTodoPendingCount(): Promise<ApiResponse<number>> {
  return request({
    url: '/todo/pending-count',
    method: 'GET',
  });
}

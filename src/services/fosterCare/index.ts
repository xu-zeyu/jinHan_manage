/**
 * 寄养服务 API
 */
import request from '@/utils/http/index';
import type {
  FosterCareRecordVO,
  FosterCarePageParams,
  FosterCareCreateParams,
  FosterCareUpdateParams,
  FosterCareStatusUpdateParams,
  PageResult,
  ApiResponse,
} from './types';

/**
 * 分页查询寄养记录列表
 */
export async function getFosterCarePage(params: FosterCarePageParams): Promise<ApiResponse<PageResult<FosterCareRecordVO>>> {
  return request({
    url: '/foster-care/page',
    method: 'GET',
    params,
  });
}

/**
 * 根据ID查询寄养记录详情
 */
export async function getFosterCareById(id: number): Promise<ApiResponse<FosterCareRecordVO>> {
  return request({
    url: `/foster-care/${id}`,
    method: 'GET',
  });
}

/**
 * 创建寄养记录
 */
export async function createFosterCare(data: FosterCareCreateParams): Promise<ApiResponse<any>> {
  return request({
    url: '/foster-care/create',
    method: 'POST',
    data,
  });
}

/**
 * 更新寄养记录
 */
export async function updateFosterCare(data: FosterCareUpdateParams): Promise<ApiResponse<any>> {
  return request({
    url: '/foster-care/update',
    method: 'POST',
    data,
  });
}

/**
 * 更新寄养状态
 */
export async function updateFosterCareStatus(data: FosterCareStatusUpdateParams): Promise<ApiResponse<any>> {
  return request({
    url: '/foster-care/status/update',
    method: 'POST',
    data,
  });
}

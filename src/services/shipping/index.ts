/**
 * 发货管理 API 服务
 */
import request from '@/utils/http/index';
import type {
  ShippingRecordVO,
  ShippingPageParams,
  ShippingCreateParams,
  ShippingUpdateParams,
  ShippingStatusUpdateParams,
  PageResult,
  ApiResponse,
} from './types';

/**
 * 分页查询发货记录列表
 */
export async function getShippingPage(params: ShippingPageParams): Promise<ApiResponse<PageResult<ShippingRecordVO>>> {
  return request({
    url: '/shipping/page',
    method: 'GET',
    params,
  });
}

/**
 * 根据ID查询发货记录详情
 */
export async function getShippingById(id: number): Promise<ApiResponse<ShippingRecordVO>> {
  return request({
    url: `/shipping/${id}`,
    method: 'GET',
  });
}

/**
 * 创建发货记录
 */
export async function createShipping(data: ShippingCreateParams): Promise<ApiResponse<any>> {
  return request({
    url: '/shipping/create',
    method: 'POST',
    data,
  });
}

/**
 * 更新发货记录
 */
export async function updateShipping(data: ShippingUpdateParams): Promise<ApiResponse<any>> {
  return request({
    url: '/shipping/update',
    method: 'POST',
    data,
  });
}

/**
 * 更新发货状态
 */
export async function updateShippingStatus(data: ShippingStatusUpdateParams): Promise<ApiResponse<any>> {
  return request({
    url: '/shipping/status/update',
    method: 'POST',
    data,
  });
}

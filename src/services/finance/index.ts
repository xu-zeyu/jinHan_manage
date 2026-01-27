/**
 * 财务管理 API 服务
 */
import request from '@/utils/http/index';
import type {
  IncomeRecordVO,
  IncomeRecordPageParams,
  IncomeRecordCreateParams,
  PageResult,
  ApiResponse,
} from './types';

/**
 * 分页查询收入列表
 */
export async function getIncomeRecordPage(
  params: IncomeRecordPageParams
): Promise<ApiResponse<PageResult<IncomeRecordVO>>> {
  return request({
    url: '/finance/page',
    method: 'GET',
    params,
  });
}

/**
 * 创建收入记录
 */
export async function createIncomeRecord(
  data: IncomeRecordCreateParams
): Promise<ApiResponse<any>> {
  return request({
    url: '/finance/income',
    method: 'POST',
    data,
  });
}

/**
 * 确认付款（财务审核）
 */
export async function confirmPayment(data: {
  orderId: string;
  orderAmount: number;
  paymentMethod: string;
  reviewedBy: number;
},id: number): Promise<ApiResponse<any>> {
  return request({
    url: '/finance/confirm-payment' + `/${id}`,
    method: 'POST',
    data,
  });
}

/**
 * 更新收入记录
 */
export async function updateIncomeRecord(
  id: number,
  data: IncomeRecordCreateParams
): Promise<ApiResponse<any>> {
  return request({
    url: `/finance/income/${id}`,
    method: 'PUT',
    data,
  });
}

/**
 * 删除收入记录
 */
export async function deleteIncomeRecord(id: number): Promise<ApiResponse<any>> {
  return request({
    url: `/finance/income/${id}`,
    method: 'DELETE',
  });
}

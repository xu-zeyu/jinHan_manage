/**
 * 订单管理 API 服务
 */
import request from '@/utils/http/index';
import type {
  OrderVO,
  OrderItemVO,
  OrderPageParams,
  OrderCreateParams,
  OrderPayParams,
  PageResult,
  ApiResponse,
} from './types';

/**
 * 分页查询订单列表
 */
export async function getOrderPage(params: OrderPageParams): Promise<ApiResponse<PageResult<OrderVO>>> {
  return request({
    url: '/order/page',
    method: 'GET',
    params,
  });
}

/**
 * 根据订单ID查询订单详情
 */
export async function getOrderById(orderId: string): Promise<ApiResponse<OrderVO>> {
  return request({
    url: `/order/${orderId}`,
    method: 'GET',
  });
}

/**
 * 创建订单
 */
export async function createOrder(data: OrderCreateParams): Promise<ApiResponse<any>> {
  return request({
    url: '/order/create',
    method: 'POST',
    data,
  });
}

/**
 * 支付订单
 */
export async function payOrder(data: OrderPayParams): Promise<ApiResponse<any>> {
  return request({
    url: '/order/pay',
    method: 'POST',
    data,
  });
}

/**
 * 取消订单
 */
export async function cancelOrder(orderId: string): Promise<ApiResponse<any>> {
  return request({
    url: `/order/cancel/${orderId}`,
    method: 'POST',
  });
}

/**
 * 确认收货（完成订单）
 */
export async function completeOrder(orderId: string): Promise<ApiResponse<any>> {
  return request({
    url: `/order/complete/${orderId}`,
    method: 'POST',
  });
}

/**
 * 管理员审核订单
 */
export async function auditOrder(orderId: string, approved: boolean): Promise<ApiResponse<any>> {
  return request({
    url: `/order/audit`,
    method: 'POST',
    data: {
      orderId,
      approved,
    },
  });
}

/**
 * 管理员发货
 */
export async function shipOrder(orderId: string, logisticsCompany: string, logisticsNo: string): Promise<ApiResponse<any>> {
  return request({
    url: `/order/ship`,
    method: 'POST',
    data: {
      orderId,
      logisticsCompany,
      logisticsNo,
    },
  });
}

/**
 * 确认订单（去确认）
 */
export async function affirmOrder(orderId: string): Promise<ApiResponse<any>> {
  return request({
    url: '/order/affirm',
    method: 'POST',
    data: {
      orderId,
    },
  });
}

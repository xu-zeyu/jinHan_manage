/**
 * 发货管理相关类型定义
 */

// 发货状态枚举
export enum ShippingStatusEnum {
  PENDING_SHIP = 'PENDING_SHIP',    // 待发货
  SHIPPED = 'SHIPPED',         // 已发货
  IN_TRANSIT = 'IN_TRANSIT',      // 运输中
  DELIVERED = 'DELIVERED',       // 已送达
  FAILED = 'FAILED',           // 发货失败
}

// 发货记录VO
export interface ShippingRecordVO {
  id: number;
  orderId: string;
  logisticsCompany: string;
  logisticsNo: string;
  shippingAddress: string;
  shipTime: string;
  status: ShippingStatusEnum;
  remark: string;
  createdTime: string;
  updatedTime: string;
  createdBy: string;
  updatedBy: string;
}

// 分页查询参数
export interface ShippingPageParams {
  page?: number;
  size?: number;
  orderId?: string;
  logisticsNo?: string;
  status?: string;
}

// 创建发货记录参数
export interface ShippingCreateParams {
  orderId: string;
  logisticsCompany: string;
  logisticsNo: string;
  shippingAddress: string;
  remark?: string;
}

// 更新发货记录参数
export interface ShippingUpdateParams {
  id: number;
  logisticsCompany?: string;
  logisticsNo?: string;
  shippingAddress?: string;
  remark?: string;
}

// 更新发货状态参数
export interface ShippingStatusUpdateParams {
  id: number;
  status: ShippingStatusEnum;
}

// 分页结果
export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
}

// API 响应格式
export interface ApiResponse<T = any> {
  code: string;
  message: string;
  data: T;
  success: boolean;
}

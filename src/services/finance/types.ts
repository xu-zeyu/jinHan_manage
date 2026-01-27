/**
 * 财务管理相关类型定义
 */

// 收入记录状态枚举
export enum IncomeRecordStatusEnum {
  PENDING_REVIEW = 'PENDING_REVIEW', // 待审核
  CONFIRMED = 'CONFIRMED', // 已确认
  REJECTED = 'REJECTED', // 已拒绝
}

// 收入类型枚举
export enum IncomeRecordTypeEnum {
  ORDER_INCOME = 'ORDER_INCOME', // 订单收入
  PRODUCT_SALE = 'PRODUCT_SALE', // 产品销售
  SERVICE_FEE = 'SERVICE_FEE', // 服务费用
  OTHER_INCOME = 'OTHER_INCOME', // 其他收入
}

// 收入记录 VO
export interface IncomeRecordVO {
  id: number;
  type: IncomeRecordTypeEnum;
  money: number;
  described: string;
  orderId?: string;
  evidenceUrl?: string;
  reviewedBy?: number;
  reviewedTime?: string;
  createdTime: string;
  status: IncomeRecordStatusEnum;
}

// 收入分页查询参数
export interface IncomeRecordPageParams {
  page?: number;
  size?: number;
  type?: IncomeRecordTypeEnum;
  status?: IncomeRecordStatusEnum;
}

// 创建收入记录参数
export interface IncomeRecordCreateParams {
  type: IncomeRecordTypeEnum;
  money: number;
  described: string;
  orderId?: string;
  evidenceUrl?: string;
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

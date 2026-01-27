/**
 * 订单相关类型定义
 */

// 订单状态枚举
export enum OrderStatusEnum {
  PENDING_PAYMENT = 'PENDING_PAYMENT', // 待付款
  PAID = 'PAID',  // 已付款，等待财务审核
  PENDING_CONFIRM = 'PENDING_CONFIRM', // 财务审核通过 ->  待确认
  PROCESSING = 'PROCESSING', // 处理中
  PENDING_SHIP = 'PENDING_SHIP', // 待发货
  SHIPPED = 'SHIPPED', // 已发货
  COMPLETED = 'COMPLETED', // 已完成
  CLOSED = 'CLOSED', // 已取消
}

// 支付方式枚举
export enum PaymentMethodEnum {
  BANK = 'BANK', // 银行转账
  ALIPAY = 'ALIPAY', // 支付宝
  WECHAT = 'WECHAT', // 微信支付
}

// 订单商品项
export interface OrderItemVO {
  itemId: number;
  orderId: string;
  goodsId: number;
  productName: string;
  quantity: number;
  fixedPrice: number;
  subtotal: number;
}

// 订单主表
export interface OrderVO {
  orderId: string;
  userId: number;
  status: OrderStatusEnum;
  address: string;
  totalAmount: number;
  paymentMethod: PaymentMethodEnum;
  paymentAmount: number;
  createdTime: string;
  updatedTime: string;
  orderItems: OrderItemVO[];
}

// 订单分页查询参数
export interface OrderPageParams {
  page?: number;
  size?: number;
  status?: OrderStatusEnum;
  orderId?: string;
}

// 创建订单参数
export interface OrderCreateParams {
  goodsId: number;
  quantity?: number;
}

// 支付订单参数
export interface OrderPayParams {
  orderId: string;
  paymentMethod: PaymentMethodEnum;
  orderAmount?: number;
  evidence?: string;
  note?: string;
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

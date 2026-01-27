/**
 * 寄养服务相关类型定义
 */

// 寄养状态枚举
export enum FosterCareStatusEnum {
  PENDING = 'PENDING', // 待寄养
  FOSTERING = 'FOSTERING', // 寄养中
  COMPLETED = 'COMPLETED', // 已完成
  CANCELLED = 'CANCELLED', // 已取消
}

// 宠物类型枚举
export enum PetTypeEnum {
  CAT = 'CAT', // 猫
  DOG = 'DOG', // 狗
  BIRD = 'BIRD', // 鸟类
  RABBIT = 'RABBIT', // 兔子
  OTHER = 'OTHER', // 其他
}

// 寄养记录VO
export interface FosterCareRecordVO {
  id: number;
  petId: number;
  petName: string;
  petType: PetTypeEnum;
  ownerName: string;
  ownerPhone: string;
  fosterStartDate: string;
  fosterEndDate: string;
  fosterDays: number;
  fosterPrice: string;
  totalAmount: string;
  fosterAddress: string;
  specialRequirements: string;
  status: FosterCareStatusEnum;
  remark: string;
  createdTime: string;
  updatedTime: string;
  createdBy: string;
  updatedBy: string;
}

// 分页查询参数
export interface FosterCarePageParams {
  page?: number;
  size?: number;
  petName?: string;
  petType?: string;
  ownerName?: string;
  ownerPhone?: string;
  status?: string;
  fosterStartDateStart?: string;
  fosterStartDateEnd?: string;
}

// 创建寄养记录参数
export interface FosterCareCreateParams {
  petId: number;
  petName: string;
  petType: string;
  ownerName: string;
  ownerPhone: string;
  fosterStartDate: string;
  fosterEndDate: string;
  fosterPrice: number;
  fosterAddress: string;
  specialRequirements?: string;
  remark?: string;
}

// 更新寄养记录参数
export interface FosterCareUpdateParams {
  id: number;
  petName?: string;
  petType?: string;
  ownerName?: string;
  ownerPhone?: string;
  fosterStartDate?: string;
  fosterEndDate?: string;
  fosterPrice?: number;
  fosterAddress?: string;
  specialRequirements?: string;
  remark?: string;
}

// 更新寄养状态参数
export interface FosterCareStatusUpdateParams {
  id: number;
  status: FosterCareStatusEnum;
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

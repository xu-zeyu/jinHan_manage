/**
 * 用户管理相关类型定义
 */

export interface UserVO {
  userId: number;
  username?: string;
  phone?: string;
  status?: UserStatusEnum;
  createdTime?: string;
  updatedTime?: string;
  lastLoginAt?: string;
  idNumber?: string;
  gender?: GenderEnum;
}

export interface UserFormVO {
  userId?: number;
  username?: string;
  phone?: string;
  password?: string;
  status?: UserStatusEnum;
}

export interface UserPageParams {
  page: number;
  size: number;
  username?: string;
  phone?: string;
  status?: UserStatusEnum;
  gender?: GenderEnum;
}

export enum UserStatusEnum {
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export const UserStatusTextMap: Record<UserStatusEnum, string> = {
  [UserStatusEnum.UNAUTHENTICATED]: '未认证',
  [UserStatusEnum.UNDER_REVIEW]: '审核中',
  [UserStatusEnum.COMPLETED]: '已完成',
  [UserStatusEnum.REJECTED]: '已拒绝',
}

export interface UserAuthInfoVO {
  id?: number;
  userId?: number;
  idNumber?: string;
  realName?: string;
  gender?: GenderEnum;
  validStartDate?: string;
  validEndDate?: string;
  auditStatus?: AuditStatusEnum;
  createdTime?: string;
  updatedTime?: string;
}

export enum GenderEnum {
  MALE = 'M',
  FEMALE = 'F',
}

export const GenderTextMap: Record<GenderEnum, string> = {
  [GenderEnum.MALE]: '男',
  [GenderEnum.FEMALE]: '女',
}

export enum AuditStatusEnum {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export const AuditStatusTextMap: Record<AuditStatusEnum, string> = {
  [AuditStatusEnum.PENDING]: '待审核',
  [AuditStatusEnum.APPROVED]: '已通过',
  [AuditStatusEnum.REJECTED]: '已拒绝',
}

export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export interface ApiResponse<T = any> {
  code: string;
  message?: string;
  data: T;
}

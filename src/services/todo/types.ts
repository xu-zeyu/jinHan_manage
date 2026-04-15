/**
 * 待办相关类型定义
 */

export enum TodoStatusEnum {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
}

export enum TodoNoticeActionEnum {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
}

export interface TodoVO {
  id: number;
  bizType: string;
  bizId: string;
  title: string;
  content?: string;
  receiverType: string;
  receiverId?: number;
  status: TodoStatusEnum;
  sourceEvent?: string;
  expireTime?: string;
  completedTime?: string;
  createdTime?: string;
  updatedTime?: string;
}

export interface TodoPageParams {
  page?: number;
  size?: number;
  status?: TodoStatusEnum;
  bizType?: string;
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

export interface TodoNoticeMessage {
  action: TodoNoticeActionEnum;
  todoId: number;
  bizType: string;
  bizId: string;
  title: string;
  content?: string;
  receiverType: 'USER' | 'ADMIN';
  receiverId?: number;
  status: TodoStatusEnum;
  expireTime?: string;
}

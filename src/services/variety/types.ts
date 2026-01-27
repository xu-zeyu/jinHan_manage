/**
 * 宠物品种相关类型定义
 */

export interface VarietyVO {
  id: number;
  name: string;
  iconUrl?: string;
  minPrice: number;
  sortOrder?: number;
  status: number;
  createdTime?: string;
  updatedTime?: string;
}

export interface VarietyFormVO {
  id?: number;
  name: string;
  iconUrl?: string;
  minPrice: number;
  sortOrder?: number;
  status?: number;
}

export interface VarietyPageParams {
  page: number;
  size: number;
  name?: string;
  status?: number;
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

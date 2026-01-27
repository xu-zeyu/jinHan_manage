import type { VarietyVO, VarietyFormVO, VarietyPageParams, PageResult, ApiResponse } from './types';
import request from '@/utils/http/index'

const API_PREFIX = '/variety';

/**
 * 创建品种
 */
export async function createVariety(data: VarietyFormVO): Promise<ApiResponse<VarietyVO>> {
  return request(`${API_PREFIX}/create`, {
    method: 'POST',
    data,
  });
}

/**
 * 更新品种
 */
export async function updateVariety(data: VarietyFormVO): Promise<ApiResponse<VarietyVO>> {
  return request(`${API_PREFIX}/update`, {
    method: 'POST',
    data,
  });
}

/**
 * 删除品种
 */
export async function deleteVariety(id: number): Promise<ApiResponse<void>> {
  return request(`${API_PREFIX}/delete/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 根据ID查询品种
 */
export async function getVarietyById(id: number): Promise<ApiResponse<VarietyVO>> {
  return request(`${API_PREFIX}/find/${id}`);
}

/**
 * 分页查询品种列表
 */
export async function getVarietyPage(params: VarietyPageParams): Promise<ApiResponse<PageResult<VarietyVO>>> {
  return request(`${API_PREFIX}/page`, {
    method: 'GET',
    params,
  });
}

/**
 * 根据名称模糊搜索品种
 */
export async function searchVarietyByName(name: string): Promise<ApiResponse<PageResult<VarietyVO>>> {
  return request(`${API_PREFIX}/page`, {
    method: 'GET',
    params: {
      page: 1,
      size: 20,
      name,
    },
  });
}

/**
 * 获取所有品种列表
 */
export async function getVarietyList(params?: { name?: string }): Promise<ApiResponse<VarietyVO[]>> {
  return request(`${API_PREFIX}/find/all`, {
    method: 'GET',
    params,
  });
}

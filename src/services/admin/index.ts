/**
 * 角色管理 API 服务
 */
import request from '@/utils/http/index';
import type {
  AdminRoleVO,
  AdminPermissionVO,
  RolePageParams,
  RoleCreateParams,
  RoleUpdateParams,
  AssignPermissionParams,
  PageResult,
  ApiResponse,
} from './types';

/**
 * 分页查询角色列表
 */
export async function getRolePage(params: RolePageParams): Promise<ApiResponse<PageResult<AdminRoleVO>>> {
  return request({
    url: '/admin/role/page',
    method: 'GET',
    params,
  });
}

/**
 * 查询所有角色
 */
export async function getAllRoles(): Promise<ApiResponse<AdminRoleVO[]>> {
  return request({
    url: '/admin/role/list',
    method: 'GET',
  });
}

/**
 * 根据ID查询角色详情
 */
export async function getRoleById(id: number): Promise<ApiResponse<AdminRoleVO>> {
  return request({
    url: `/admin/role/${id}`,
    method: 'GET',
  });
}

/**
 * 创建角色
 */
export async function createRole(data: RoleCreateParams): Promise<ApiResponse<any>> {
  return request({
    url: '/admin/role/create',
    method: 'POST',
    data,
  });
}

/**
 * 更新角色
 */
export async function updateRole(data: RoleUpdateParams): Promise<ApiResponse<any>> {
  return request({
    url: '/admin/role/update',
    method: 'POST',
    data,
  });
}

/**
 * 删除角色
 */
export async function deleteRole(id: number): Promise<ApiResponse<any>> {
  return request({
    url: '/admin/role/delete',
    method: 'POST',
    data: { id },
  });
}

/**
 * 获取角色的权限列表
 */
export async function getRolePermissions(roleId: number): Promise<ApiResponse<AdminPermissionVO[]>> {
  return request({
    url: `/admin/role/${roleId}/permissions`,
    method: 'GET',
  });
}

/**
 * 为角色分配权限
 */
export async function assignRolePermissions(data: AssignPermissionParams): Promise<ApiResponse<any>> {
  return request({
    url: '/admin/role/assignPermissions',
    method: 'POST',
    data,
  });
}

/**
 * 权限管理
 */

/**
 * 分页查询权限列表
 */
export async function getPermissionPage(params: { page: number; size: number }): Promise<ApiResponse<PageResult<AdminPermissionVO>>> {
  return request({
    url: '/admin/permission/page',
    method: 'GET',
    params,
  });
}

/**
 * 查询所有权限
 */
export async function getAllPermissions(): Promise<ApiResponse<AdminPermissionVO[]>> {
  return request({
    url: '/admin/permission/list',
    method: 'GET',
  });
}

/**
 * 创建权限
 */
export async function createPermission(data: { name: string; code: string }): Promise<ApiResponse<any>> {
  return request({
    url: '/admin/permission/create',
    method: 'POST',
    data,
  });
}

/**
 * 更新权限
 */
export async function updatePermission(data: { id: number; name?: string; code?: string }): Promise<ApiResponse<any>> {
  return request({
    url: '/admin/permission/update',
    method: 'POST',
    data,
  });
}

/**
 * 删除权限
 */
export async function deletePermission(id: number): Promise<ApiResponse<any>> {
  return request({
    url: `/admin/permission/${id}`,
    method: 'DELETE',
  });
}

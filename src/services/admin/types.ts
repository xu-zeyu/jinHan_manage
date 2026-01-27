/**
 * 角色管理相关类型定义
 */

// 角色实体
export interface AdminRoleVO {
  id: number;
  rname: string;
  description: string;
  createdTime: string;
  updatedTime: string;
  deleted: number;
}

// 权限实体
export interface AdminPermissionVO {
  id: number;
  name: string;
  code: string;
}

// 树形权限节点（用于权限树组件）
export interface PermissionTreeNode {
  id: number;
  name: string;
  code: string;
  children?: PermissionTreeNode[];
}

// 分页查询参数
export interface RolePageParams {
  page?: number;
  size?: number;
  rname?: string;
}

// 创建角色参数
export interface RoleCreateParams {
  rname: string;
  description?: string;
}

// 更新角色参数
export interface RoleUpdateParams {
  id: number;
  rname?: string;
  description?: string;
}

// 分配权限参数
export interface AssignPermissionParams {
  roleId: number;
  permissionIds: number[];
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

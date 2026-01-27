import request from '@/utils/http/index'
import type {ApiResponse, PageResult, UserAuthInfoVO, UserFormVO, UserPageParams, UserVO} from './types'

const BASE_PATH = '/user'

/**
 * 获取用户列表（分页）
 */
export async function getUserPage(params: UserPageParams): Promise<ApiResponse<PageResult<UserVO>>> {
  return request({
    url: `${BASE_PATH}/page`,
    method: 'get',
    params,
  })
}

/**
 * 根据ID获取用户详情
 */
export async function getUserById(userId: number): Promise<ApiResponse<UserVO>> {
  return request({
    url: `${BASE_PATH}/${userId}`,
    method: 'get',
  })
}

/**
 * 创建用户
 */
export async function createUser(data: UserFormVO): Promise<ApiResponse<any>> {
  return request({
    url: BASE_PATH,
    method: 'post',
    data,
  })
}

/**
 * 更新用户
 */
export async function updateUser(data: UserFormVO): Promise<ApiResponse<any>> {
  return request({
    url: BASE_PATH,
    method: 'put',
    data,
  })
}

/**
 * 删除用户
 */
export async function deleteUser(userId: number): Promise<ApiResponse<any>> {
  return request({
    url: `${BASE_PATH}/${userId}`,
    method: 'delete',
  })
}

/**
 * 重置用户密码
 */
export async function resetUserPassword(userId: number, newPassword: string): Promise<ApiResponse<any>> {
  return request({
    url: `${BASE_PATH}/${userId}/reset-password`,
    method: 'put',
    data: { newPassword },
  })
}

/**
 * 冻结/解冻用户
 */
export async function freezeUser(userId: number, freeze: boolean): Promise<ApiResponse<any>> {
  return request({
    url: `${BASE_PATH}/${userId}/freeze`,
    method: 'put',
    params: { freeze },
  })
}

/**
 * 获取用户认证信息
 */
export async function getUserAuthInfo(userId: number): Promise<ApiResponse<UserAuthInfoVO>> {
  return request({
    url: `${BASE_PATH}/auth/${userId}`,
    method: 'get',
  })
}

/**
 * 审核用户认证
 */
export async function auditUserAuth(userId: number, auditStatus: string): Promise<ApiResponse<Boolean>> {
  return request({
    url: `${BASE_PATH}/auth/audit/${auditStatus}/${userId}`,
    method: 'put',
  })
}

import request from '@/utils/http/index'
import type {ApiResponse, PageResult, UserAuthInfoVO, UserPageParams, UserVO} from './types'

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

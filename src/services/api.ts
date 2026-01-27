import request from '@/utils/http/index'
import Qs from 'qs'
import type { ApiResponse } from './product/types'

interface CurrentUser {
  avatar?: string;
  name?: string;
  authority?: string[];
}

/** 获取当前的用户 GET /api/currentUser */
export async function currentUserApi(): Promise<ApiResponse<CurrentUser>> {
  return request({
    url: '/admin/info',
    method: 'get',
  });
}

/** 登录接口 POST /login/sms */
export async function login(body: API.LoginParams): Promise<ApiResponse<any>> {
  return request({
    url: '/login/sms',
    method: 'post',
    data: body,
  });
}

const BASE_SELF_PATH = 'admin/self'
// 获取用户权限信息
export const getSelfInfo = async (): Promise<ApiResponse<any>> =>
  request({
    url: BASE_SELF_PATH,
    method: 'get'
  })

import request from '@/utils/http/index'
import type { ApiResponse } from './product/types'

export async function getLoginCaptcha(name: string): Promise<ApiResponse<any>> {
  return request({
    url: `/public/captcha/login/${name}`,
    method: 'post',
  });
}

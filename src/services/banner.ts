import request from '@/utils/http/index'
import type { ApiResponse } from './product/types'

export async function bannerListApi(params: any): Promise<ApiResponse<any>> {
  return request({
    url: '/banner/page',
    method: 'get',
    params
  });
}


export async function bannerByOneApi(id: number): Promise<ApiResponse<any>> {
  return request({
    url: `/banner/${id}`,
    method: 'get',
  });
}

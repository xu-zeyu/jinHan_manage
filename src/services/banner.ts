import request from '@/utils/http/index';

export type BannerStatus = 'HIDDEN' | 'ENABLE';
export type BannerPlatform = 'ALL' | 'PC' | 'MOBILE';

export interface BannerItem {
  id: number;
  url: string;
  link?: string;
  title: string;
  description?: string;
  status: BannerStatus;
  platform: BannerPlatform;
  startTime: string;
  endTime: string;
  createdTime?: string;
  updatedTime?: string;
}

export interface BannerFormValues {
  id?: number;
  url: string;
  link?: string;
  title: string;
  description?: string;
  status: BannerStatus;
  platform: BannerPlatform;
  startTime: string;
  endTime: string;
}

export interface BannerPageParams {
  page?: number;
  size?: number;
  title?: string;
  status?: BannerStatus;
  platform?: BannerPlatform;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
}

export interface ApiResponse<T = unknown> {
  code: string;
  msg?: string;
  message?: string;
  data: T;
}

export async function bannerListApi(params: BannerPageParams): Promise<ApiResponse<PageResult<BannerItem>>> {
  return request({
    url: '/banner/page',
    method: 'get',
    params,
  });
}

export async function bannerByOneApi(id: number): Promise<ApiResponse<BannerItem>> {
  return request({
    url: `/banner/${id}`,
    method: 'get',
  });
}

export async function createBannerApi(data: BannerFormValues): Promise<ApiResponse<number>> {
  return request({
    url: '/banner/create',
    method: 'post',
    data,
  });
}

export async function updateBannerApi(data: BannerFormValues): Promise<ApiResponse<BannerItem>> {
  return request({
    url: '/banner/update',
    method: 'put',
    data,
  });
}

export async function deleteBannerApi(id: number): Promise<ApiResponse<boolean>> {
  return request({
    url: `/banner/${id}`,
    method: 'delete',
  });
}

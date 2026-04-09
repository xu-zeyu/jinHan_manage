import request from '@/utils/http/index'
import {LogDeleteParams, LogPageParams, LogVO} from "@/services/log/types";
import type {ApiResponse, PageResult} from "@/services/order/types";

// 获取日志列表
export async function getLogList(params: LogPageParams): Promise<ApiResponse<PageResult<LogVO>>>  {
  // 过滤空参数
  const filteredParams = Object.entries(params).reduce((acc: any, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {} as LogPageParams);

  return  request({
    url: '/admin/log/page',
    method: 'POST',
    data: filteredParams,
  });
}

// 删除日志
export async function deleteLog(params: LogDeleteParams): Promise<ApiResponse<boolean>> {
  return request({
    url: '/admin/log/delete',
    method: 'POST',
    data: params,
  });
}

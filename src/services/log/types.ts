
// 日志类型定义
export interface LogVO {
  id: number;
  operator: string;
  operationType: string;
  description: string;
  requestUrl: string;
  requestMethod: string;
  requestParams: string;
  responseResult: string;
  ip: string;
  operateTime: string;
  executeTime: number;
  success: boolean;
  errorMessage: string;
}

// 日志分页查询参数
export interface LogPageParams {
  page: number;
  size: number;
  operator?: string;
  operationType?: string;
  success?: boolean;
  requestMethod?: string;
}

// 日志删除参数
export interface LogDeleteParams {
  id?: number;
  ids?: number[];
}

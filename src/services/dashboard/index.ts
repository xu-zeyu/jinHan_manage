import request from '@/utils/http/index';
import type {
  DashboardSummaryVO,
  BusinessOverviewVO,
  OperationDataVO,
  UserDistributionItemVO,
  ApiResponse,
} from './types';

export async function getDashboardSummary(): Promise<ApiResponse<DashboardSummaryVO>> {
  return request({
    url: '/dashboard/summary',
    method: 'GET',
  });
}

export async function getBusinessOverview(): Promise<ApiResponse<BusinessOverviewVO>> {
  return request({
    url: '/dashboard/business-overview',
    method: 'GET',
  });
}

export async function getOperationData(): Promise<ApiResponse<OperationDataVO>> {
  return request({
    url: '/dashboard/operation-data',
    method: 'GET',
  });
}

export async function getUserDistribution(): Promise<ApiResponse<UserDistributionItemVO[]>> {
  return request({
    url: '/dashboard/user-distribution',
    method: 'GET',
  });
}
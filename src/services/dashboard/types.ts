export interface DashboardSummaryVO {
  todayOrderCount: number;
  todayOrderAmount: number;
  todayIncome: number;
  todayNewUsers: number;
  totalProducts: number;
  onSaleProducts: number;
  offSaleProducts: number;
}

export interface TrendPoint {
  date: string;
  value: number;
  type?: string;
}

export interface BusinessOverviewVO {
  totalOrders: number;
  totalUsers: number;
  activeUsers: number;
  pendingOrders: number;
  orderTrend: TrendPoint[];
}

export interface OperationDataVO {
  monthlyProfit: number;
  monthlyExpense: number;
  inventoryRate: number;
  incomeTrend: TrendPoint[];
}

export interface UserDistributionItemVO {
  type: string;
  value: number;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
}

export interface ApiResponse<T = any> {
  code: string;
  message: string;
  data: T;
  success: boolean;
}
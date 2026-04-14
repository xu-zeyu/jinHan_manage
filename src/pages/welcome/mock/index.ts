import type { OrderData, UserDataStats, FinanceData, ProductData } from '../types';

export const mockOrderData: OrderData = {
  totalOrders: 1234,
  todayOrders: 86,
  pendingOrders: 23,
  completedOrders: 987,
  orderGrowth: 12.5,
  orderTrend: [
    { date: '周一', count: 65 },
    { date: '周二', count: 78 },
    { date: '周三', count: 92 },
    { date: '周四', count: 88 },
    { date: '周五', count: 105 },
    { date: '周六', count: 120 },
    { date: '周日', count: 86 },
  ],
};

export const mockUserData: UserDataStats = {
  totalUsers: 8542,
  todayNewUsers: 156,
  activeUsers: 3240,
  inactiveUsers: 123,
  userGrowth: 8.3,
  userDistribution: [
    { type: '男性', value: 52 },
    { type: '女性', value: 48 },
  ],
};

export const mockFinanceData: FinanceData = {
  totalRevenue: 1256800,
  todayRevenue: 89500,
  profit: 385600,
  expense: 871200,
  revenueGrowth: 15.8,
  monthlyRevenue: [
    { month: '1月', type: '收入', value: 95000 },
    { month: '1月', type: '支出', value: 65000 },
    { month: '2月', type: '收入', value: 108000 },
    { month: '2月', type: '支出', value: 72000 },
    { month: '3月', type: '收入', value: 125000 },
    { month: '3月', type: '支出', value: 85000 },
    { month: '4月', type: '收入', value: 118000 },
    { month: '4月', type: '支出', value: 80000 },
    { month: '5月', type: '收入', value: 135000 },
    { month: '5月', type: '支出', value: 92000 },
    { month: '6月', type: '收入', value: 148000 },
    { month: '6月', type: '支出', value: 97200 },
  ],
};

export const mockProductData: ProductData = {
  totalProducts: 568,
  inStockProducts: 423,
  outOfStockProducts: 15,
  hotProducts: 28,
  stockRate: 74.5,
};
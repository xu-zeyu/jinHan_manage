import type { OrderData, UserDataStats, FinanceData, ProductData, TodoData } from '../types';

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

export const mockTodoData: TodoData = {
  total: 8,
  pending: 5,
  completed: 3,
  list: [
    {
      id: 1,
      title: '审核新用户注册申请',
      priority: 'high',
      status: 'pending',
      dueDate: '今天',
      category: 'user',
    },
    {
      id: 2,
      title: '处理待发货订单',
      priority: 'high',
      status: 'pending',
      dueDate: '今天',
      category: 'order',
    },
    {
      id: 3,
      title: '更新商品库存信息',
      priority: 'medium',
      status: 'pending',
      dueDate: '明天',
      category: 'product',
    },
    {
      id: 4,
      title: '财务报表核对',
      priority: 'medium',
      status: 'pending',
      dueDate: '本周',
      category: 'finance',
    },
    {
      id: 5,
      title: '系统安全巡检',
      priority: 'low',
      status: 'pending',
      dueDate: '本月',
      category: 'system',
    },
    {
      id: 6,
      title: '完成上月销售数据分析',
      priority: 'high',
      status: 'completed',
      dueDate: '已完成',
      category: 'finance',
    },
    {
      id: 7,
      title: '更新商品分类',
      priority: 'medium',
      status: 'completed',
      dueDate: '已完成',
      category: 'product',
    },
    {
      id: 8,
      title: '用户反馈汇总处理',
      priority: 'low',
      status: 'completed',
      dueDate: '已完成',
      category: 'user',
    },
  ],
};
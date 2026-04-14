export interface UserData {
  id: number;
  username: string;
  realName: string;
  phone: string;
  avatar: string | null;
  createdTime: string;
  lastLoginTime: string;
  role: any;
  updatedTime: string;
  position: string;
}

export interface WeatherData {
  city: string;
  temperature: number;
  weather: string;
  humidity: number;
  wind: string;
}

export interface OrderData {
  totalOrders: number;
  todayOrders: number;
  pendingOrders: number;
  completedOrders: number;
  orderGrowth: number;
  orderTrend: Array<{ date: string; count: number }>;
}

export interface UserDataStats {
  totalUsers: number;
  todayNewUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  userGrowth: number;
  userDistribution: Array<{ type: string; value: number }>;
}

export interface FinanceData {
  totalRevenue: number;
  todayRevenue: number;
  profit: number;
  expense: number;
  revenueGrowth: number;
  monthlyRevenue: Array<{ month: string; type: string; value: number }>;
}

export interface ProductData {
  totalProducts: number;
  inStockProducts: number;
  outOfStockProducts: number;
  hotProducts: number;
  stockRate: number;
}
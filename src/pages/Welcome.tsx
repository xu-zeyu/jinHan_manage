import { useModel } from '@umijs/max';
import { Card, Row, Col, Skeleton } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import { currentUserApi } from '@/services/api';
import {
  ShoppingCartOutlined,
  UserOutlined,
  WalletOutlined,
  PauseOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CalendarOutlined,
  CloudOutlined,
  SunOutlined,
  CloudFilled,
  MailOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { Line, Column, Pie } from '@ant-design/charts';
import { PageContainer } from '@ant-design/pro-components';

interface UserData {
  id: number;
  username: string;
  realName: string;
  phone: string;
  avatar: string;
  createdTime: string;
  lastLoginTime: string;
  role: any;
  updatedTime: string;
  position: string;
}

interface WeatherData {
  city: string;
  temperature: number;
  weather: string;
  humidity: number;
  wind: string;
}

const mockOrderData = {
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

const mockUserData = {
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

const mockFinanceData = {
  totalRevenue: 1256800,
  todayRevenue: 89500,
  profit: 385600,
  expense: 871200,
  revenueGrowth: 15.8,
  monthlyData: [
    { month: '1月', revenue: 95000, expense: 65000 },
    { month: '2月', revenue: 108000, expense: 72000 },
    { month: '3月', revenue: 125000, expense: 85000 },
    { month: '4月', revenue: 118000, expense: 80000 },
    { month: '5月', revenue: 135000, expense: 92000 },
    { month: '6月', revenue: 148000, expense: 97200 },
  ],
};

const mockProductData = {
  totalProducts: 568,
  inStockProducts: 423,
  outOfStockProducts: 15,
  hotProducts: 28,
  stockRate: 74.5,
};

const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekDay = weekDays[now.getDay()];
  return { year, month, day, weekDay };
};

const getWeatherBackground = (weatherType: string) => {
  switch (weatherType) {
    case 'sunny':
      return 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)';
    case 'rainy':
      return 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)';
    default:
      return 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
  }
};

const WeatherIcon: React.FC<{ type: string; size?: number }> = ({ type, size = 20 }) => {
  const iconProps = { style: { fontSize: size } };
  switch (type) {
    case 'sunny':
      return <SunOutlined {...iconProps} style={{ ...iconProps.style, color: '#FAAD14' }} />;
    case 'cloudy':
      return <CloudOutlined {...iconProps} style={{ ...iconProps.style, color: '#64748b' }} />;
    case 'rainy':
      return <CloudFilled {...iconProps} style={{ ...iconProps.style, color: '#3b82f6' }} />;
    default:
      return <CloudOutlined {...iconProps} style={{ ...iconProps.style, color: '#64748b' }} />;
  }
};

const AnimatedNumber: React.FC<{ value: number; duration?: number; prefix?: string; suffix?: string }> = ({
  value,
  duration = 1200,
  prefix = '',
  suffix = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    let startTime: number | null = null;
    const startValue = displayValue;
    const endValue = value;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + (endValue - startValue) * easeOut);
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value]);

  return (
    <span>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
};

const OrderTrendChart: React.FC = () => {
  const config = {
    data: mockOrderData.orderTrend,
    xField: 'date',
    yField: 'count',
    smooth: true,
    point: false,
    areaStyle: { fill: 'l(0) 0:#e0e7ff 1:#fff' },
    color: '#6366f1',
    xAxis: {
      grid: false,
      label: false,
      line: false,
      tickLine: false,
    },
    yAxis: {
      grid: { line: { style: { stroke: '#f8fafc', lineWidth: 0.5 } } },
      label: false,
      line: false,
      tickLine: false,
    },
    padding: [0, 0, 0, 0],
    autoFit: true,
  };
  return <Line {...config} style={{ height: 28, width: '100%' }} />;
};

const FinanceChart: React.FC = () => {
  const transformedData = [];
  mockFinanceData.monthlyData.forEach(item => {
    transformedData.push({ month: item.month, type: '收入', value: item.revenue });
    transformedData.push({ month: item.month, type: '支出', value: item.expense });
  });

  const config = {
    data: transformedData,
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    isGroup: true,
    columnStyle: { radius: [1, 1, 0, 0] },
    color: ['#10b981', '#f59e0b'],
    xAxis: {
      grid: false,
      label: false,
      line: false,
      tickLine: false,
    },
    yAxis: {
      grid: { line: { style: { stroke: '#f8fafc', lineWidth: 0.5 } } },
      label: false,
      line: false,
      tickLine: false,
    },
    padding: [0, 0, 0, 0],
    legend: false,
    autoFit: true,
  };
  return <Column {...config} style={{ height: 28, width: '100%' }} />;
};

const UserPieChart: React.FC = () => {
  const config = {
    data: mockUserData.userDistribution,
    angleField: 'value',
    colorField: 'type',
    radius: 0.85,
    innerRadius: 0.75,
    label: { type: 'inner', content: (datum: { percent: number }) => `${(datum.percent * 100).toFixed(0)}%`, style: { fontSize: 7, fontWeight: 600, fill: '#fff' } },
    interactions: [{ type: 'element-active' }],
    color: ['#6366f1', '#ec4899'],
    padding: [0, 0, 0, 0],
    autoFit: true,
  };
  return <Pie {...config} style={{ height: 60, width: 60 }} />;
};

const WelcomeSkeleton: React.FC = () => (
  <div style={{ padding: '16px' }}>
    <Card variant="outlined" styles={{ body: { padding: '20px' } }} style={{ marginBottom: 16, borderRadius: 16 }}>
      <Row gutter={16} align="middle">
        <Col xs={24} sm={12} md={16}>
          <Row gutter={12} align="center">
            <Col span={4}>
              <Skeleton.Avatar active size="small" />
            </Col>
            <Col span={20}>
              <Skeleton.Input active style={{ width: '60%', marginBottom: 8 }} />
              <div style={{ display: 'flex', gap: 12 }}>
                <Skeleton.Input active style={{ width: '40%' }} />
                <Skeleton.Input active style={{ width: '40%' }} />
              </div>
            </Col>
          </Row>
          <Row gutter={8} style={{ marginTop: 16 }}>
            <Col span={10}>
              <Skeleton.Input active style={{ height: 44 }} />
            </Col>
            <Col span={10}>
              <Skeleton.Input active style={{ height: 44 }} />
            </Col>
          </Row>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Skeleton.Input active style={{ height: 120 }} />
        </Col>
      </Row>
    </Card>

    <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} md={6}>
        <Skeleton.Input active style={{ height: 64 }} />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Skeleton.Input active style={{ height: 64 }} />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Skeleton.Input active style={{ height: 64 }} />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Skeleton.Input active style={{ height: 64 }} />
      </Col>
    </Row>

    <Row gutter={16}>
      <Col xs={24} lg={12}>
        <Card variant="outlined" styles={{ body: { padding: '16px' } }} style={{ borderRadius: 12 }}>
          <Skeleton.Input active style={{ width: 80, marginBottom: 12 }} />
          <Row gutter={4} style={{ marginBottom: 12 }}>
            <Col span={6}><Skeleton.Input active style={{ height: 40 }} /></Col>
            <Col span={6}><Skeleton.Input active style={{ height: 40 }} /></Col>
            <Col span={6}><Skeleton.Input active style={{ height: 40 }} /></Col>
            <Col span={6}><Skeleton.Input active style={{ height: 40 }} /></Col>
          </Row>
          <Skeleton.Input active style={{ height: 70 }} />
        </Card>
      </Col>
      <Col xs={24} lg={12}>
        <Card variant="outlined" styles={{ body: { padding: '16px' } }} style={{ borderRadius: 12 }}>
          <Skeleton.Input active style={{ width: 80, marginBottom: 12 }} />
          <Row gutter={4} style={{ marginBottom: 12 }}>
            <Col span={8}><Skeleton.Input active style={{ height: 40 }} /></Col>
            <Col span={8}><Skeleton.Input active style={{ height: 40 }} /></Col>
            <Col span={8}><Skeleton.Input active style={{ height: 40 }} /></Col>
          </Row>
          <Skeleton.Input active style={{ height: 70 }} />
        </Card>
      </Col>
    </Row>
  </div>
);

const Welcome: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const currentDate = getCurrentDate();

  const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('浏览器不支持地理位置服务'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    });
  };

  const getCityName = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://restapi.amap.com/v3/geocode/regeo?location=${longitude},${latitude}&key=5c691a783e21e7102d8a5890c93b1d11&radius=1000&extensions=base`
      );
      const data = await response.json();
      if (data.status === '1' && data.regeocode && data.regeocode.addressComponent) {
        return data.regeocode.addressComponent.city || data.regeocode.addressComponent.province;
      }
      return '未知城市';
    } catch (error) {
      console.error('获取城市名称失败:', error);
      return '未知城市';
    }
  };

  const fetchWeatherData = async () => {
    let city = '北京';
    try {
      const location = await getCurrentLocation();
      city = await getCityName(location.latitude, location.longitude);
    } catch (locationError) {
      console.warn('无法获取当前位置，使用默认城市:', locationError);
    }

    try {
      const response = await fetch(
        `https://restapi.amap.com/v3/weather/weatherInfo?city=${encodeURIComponent(city)}&key=5c691a783e21e7102d8a5890c93b1d11&extensions=base`
      );
      const data = await response.json();

      if (data.status === '1' && data.lives && data.lives.length > 0) {
        const weatherInfo = data.lives[0];
        let weatherType = 'cloudy';
        if (weatherInfo.weather.includes('晴')) {
          weatherType = 'sunny';
        } else if (weatherInfo.weather.includes('雨') || weatherInfo.weather.includes('雷')) {
          weatherType = 'rainy';
        }

        setWeatherData({
          city: weatherInfo.city,
          temperature: parseInt(weatherInfo.temperature),
          weather: weatherType,
          humidity: parseInt(weatherInfo.humidity),
          wind: weatherInfo.winddirection + weatherInfo.windpower,
        });
        return;
      }
    } catch (apiError) {
      console.error('获取天气数据失败:', apiError);
    }

    setWeatherData({
      city,
      temperature: Math.floor(Math.random() * 30) + 15,
      weather: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)],
      humidity: Math.floor(Math.random() * 40) + 40,
      wind: ['微风', '东风', '南风', '北风'][Math.floor(Math.random() * 4)],
    });
  };

  const fetchUserData = async () => {
    try {
      const response: any = await currentUserApi();
      if (response.code == "200") {
        setUserData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchWeatherData();
  }, []);

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    growth?: number;
    color: string;
  }> = ({ title, value, icon, growth, color }) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px',
        backgroundColor: '#fff',
        borderRadius: 12,
        border: '1px solid #e2e8f0',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          backgroundColor: `${color}12`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ color, fontSize: 20 }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: '12px', color: '#64748b' }}>{title}</div>
        <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', marginTop: 2 }}>
          <AnimatedNumber value={value} />
        </div>
        {growth !== undefined && (
          <div style={{ fontSize: '11px', color: growth >= 0 ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: 2, marginTop: 2 }}>
            {growth >= 0 ? <ArrowUpOutlined style={{ fontSize: 10 }} /> : <ArrowDownOutlined style={{ fontSize: 10 }} />}
            {Math.abs(growth)}%
          </div>
        )}
      </div>
    </div>
  );

  const MiniStat: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
    <div style={{ textAlign: 'center', padding: '10px 6px', backgroundColor: `${color}08`, borderRadius: 8 }}>
      <div style={{ fontSize: '11px', color: '#64748b' }}>{label}</div>
      <div style={{ fontSize: '18px', fontWeight: 700, color, marginTop: 3 }}>
        <AnimatedNumber value={value} />
      </div>
    </div>
  );

  const FinanceStatCard: React.FC<{ label: string; value: number; color: string; isMoney?: boolean }> = ({
    label,
    value,
    color,
    isMoney = false
  }) => (
    <div style={{ padding: '10px', backgroundColor: `${color}08`, borderRadius: 8, textAlign: 'center' }}>
      <div style={{ fontSize: '11px', color: '#64748b' }}>{label}</div>
      <div style={{ fontSize: '18px', fontWeight: 700, color, marginTop: 3 }}>
        {isMoney ? <AnimatedNumber value={Math.round(value / 1000)} prefix="¥" suffix="k" /> : <AnimatedNumber value={value} suffix="%" />}
      </div>
    </div>
  );

  if (loading) {
    return <WelcomeSkeleton />;
  }

  return (
    <PageContainer header={{ title: '' }}>
        {/* 欢迎卡片 - 左右布局 */}
        <Card
          variant="outlined"
          styles={{
            body: { padding: '0' },
            header: { display: 'none' },
          }}
          style={{
            borderRadius: 16,
            border: 'none',
            background: weatherData ? getWeatherBackground(weatherData.weather) : '#fff',
            marginBottom: 16,
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            overflow: 'hidden',
          }}
        >
          <Row gutter={0}>
            {/* 左侧 - 用户信息、日期、天气 */}
            <Col xs={24} sm={24} md={16}>
              <div style={{ padding: '20px' }}>
                {/* 用户信息 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      backgroundColor: 'rgba(255,255,255,0.85)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                    }}
                  >
                    {userData?.avatar ? (
                      <img
                        src={userData.avatar}
                        alt="用户头像"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <UserOutlined style={{ fontSize: 28, color: '#94a3b8' }} />
                    )}
                  </div>

                  <div>
                    <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>欢迎回来</div>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', marginTop: 2 }}>
                      {userData?.realName || '用户'}
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '12px', color: '#64748b' }}>
                        <MailOutlined style={{ fontSize: 14 }} />
                        {userData?.username || '-'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '12px', color: '#64748b' }}>
                        <PhoneOutlined style={{ fontSize: 14 }} />
                        {userData?.phone || '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 日期和天气 */}
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                      <CalendarOutlined style={{ fontSize: 20, color: '#6366f1' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>今日日期</div>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: '#334155' }}>
                        {currentDate.year}年{currentDate.month}月{currentDate.day}日
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{currentDate.weekDay}</div>
                    </div>
                  </div>

                  {weatherData && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                        <WeatherIcon type={weatherData.weather} size={22} />
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>当前天气</div>
                        <div style={{ fontSize: '16px', fontWeight: 600, color: '#334155' }}>
                          {weatherData.temperature}°C {weatherData.weather === 'sunny' ? '晴天' : weatherData.weather === 'rainy' ? '雨天' : '多云'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{weatherData.city}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Col>

            {/* 右侧 - 用户分布饼图 */}
            <Col xs={24} sm={24} md={7}>
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px'}}>
                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, marginBottom: 6 }}>用户分布</div>
                  <UserPieChart />
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '9px', color: '#64748b', fontWeight: 500 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#6366f1' }} />
                    男
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '9px', color: '#64748b', fontWeight: 500 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#ec4899' }} />
                    女
                  </span>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* 统计卡片 */}
        <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <StatCard
              title="今日订单"
              value={mockOrderData.todayOrders}
              icon={<ShoppingCartOutlined />}
              growth={mockOrderData.orderGrowth}
              color="#6366f1"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatCard
              title="新增用户"
              value={mockUserData.todayNewUsers}
              icon={<UserOutlined />}
              growth={mockUserData.userGrowth}
              color="#0ea5e9"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatCard
              title="今日收入"
              value={Math.round(mockFinanceData.todayRevenue / 1000)}
              icon={<WalletOutlined />}
              growth={mockFinanceData.revenueGrowth}
              color="#10b981"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatCard
              title="库存商品"
              value={mockProductData.inStockProducts}
              icon={<PauseOutlined />}
              color="#f59e0b"
            />
          </Col>
        </Row>

        {/* 核心数据区域 */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card
              variant="outlined"
              styles={{
                body: { padding: '16px' },
                header: { display: 'none' },
              }}
              style={{ borderRadius: 12, borderColor: '#e2e8f0', backgroundColor: '#fff' }}
            >
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#334155', marginBottom: 12 }}>业务概览</div>
              <Row gutter={[4, 4]} style={{ marginBottom: 12 }}>
                <Col span={6}>
                  <MiniStat label="总订单" value={mockOrderData.totalOrders} color="#6366f1" />
                </Col>
                <Col span={6}>
                  <MiniStat label="待处理" value={mockOrderData.pendingOrders} color="#f59e0b" />
                </Col>
                <Col span={6}>
                  <MiniStat label="总用户" value={mockUserData.totalUsers} color="#10b981" />
                </Col>
                <Col span={6}>
                  <MiniStat label="活跃" value={mockUserData.activeUsers} color="#ec4899" />
                </Col>
              </Row>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: 8 }}>订单趋势</div>
                <OrderTrendChart />
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              variant="outlined"
              styles={{
                body: { padding: '16px' },
                header: { display: 'none' },
              }}
              style={{ borderRadius: 12, borderColor: '#e2e8f0', backgroundColor: '#fff' }}
            >
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#334155', marginBottom: 12 }}>经营数据</div>
              <Row gutter={[4, 4]} style={{ marginBottom: 12 }}>
                <Col span={8}>
                  <FinanceStatCard label="本月利润" value={mockFinanceData.profit} color="#10b981" isMoney />
                </Col>
                <Col span={8}>
                  <FinanceStatCard label="本月支出" value={mockFinanceData.expense} color="#f59e0b" isMoney />
                </Col>
                <Col span={8}>
                  <FinanceStatCard label="库存率" value={mockProductData.stockRate} color="#6366f1" />
                </Col>
              </Row>
              <div>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: 8 }}>收支趋势</div>
                <FinanceChart />
              </div>
            </Card>
          </Col>
        </Row>
    </PageContainer>
  );
};

export default Welcome;

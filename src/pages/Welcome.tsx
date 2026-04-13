import { useModel } from '@umijs/max';
import { Card, Row, Col, Skeleton, Tooltip } from 'antd';
import React, { useEffect, useState, useRef, useMemo } from 'react';
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
  EnvironmentOutlined,
  DashboardOutlined,
  SettingOutlined,
  FileTextOutlined,
  TeamOutlined,
  BellOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { Line, Column, Pie } from '@ant-design/charts';
import { PageContainer } from '@ant-design/pro-components';
import { history } from '@umijs/max';

// ===================== Types =====================
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

// ===================== Mock Data =====================
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

// ===================== Utils =====================
const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekDay = weekDays[now.getDay()];
  const hours = now.getHours();
  let greeting = '早上好';
  if (hours >= 12 && hours < 14) greeting = '中午好';
  else if (hours >= 14 && hours < 18) greeting = '下午好';
  else if (hours >= 18) greeting = '晚上好';
  return { year, month, day, weekDay, greeting };
};

const getWeatherIcon = (type: string) => {
  const size = 15;
  switch (type) {
    case 'sunny':
      return <SunOutlined style={{ fontSize: size, color: '#f59e0b' }} />;
    case 'rainy':
      return <CloudFilled style={{ fontSize: size, color: '#3b82f6' }} />;
    default:
      return <CloudOutlined style={{ fontSize: size, color: '#94a3b8' }} />;
  }
};

const getWeatherLabel = (type: string) => {
  switch (type) {
    case 'sunny': return '晴';
    case 'rainy': return '雨';
    default: return '多云';
  }
};

const getWeatherTypeFromWMO = (code: number): string => {
  if (code === 0 || code === 1) return 'sunny';
  if (code >= 51 || code === 45 || code === 48) return 'rainy';
  return 'cloudy';
};

// ===================== CSS Keyframes (inject once) =====================
const styleId = 'welcome-page-animations';
if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes welcomeFadeInUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes welcomePulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    .welcome-fade-in { animation: welcomeFadeInUp 0.4s ease-out both; }
    .welcome-fade-in-d1 { animation: welcomeFadeInUp 0.4s ease-out 0.05s both; }
    .welcome-fade-in-d2 { animation: welcomeFadeInUp 0.4s ease-out 0.1s both; }
    .welcome-fade-in-d3 { animation: welcomeFadeInUp 0.4s ease-out 0.15s both; }
    .welcome-fade-in-d4 { animation: welcomeFadeInUp 0.4s ease-out 0.2s both; }
    .welcome-skeleton-pulse { animation: welcomePulse 1.5s ease-in-out infinite; }
    .welcome-stat-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .welcome-stat-card:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
    }
    .welcome-quick-item {
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .welcome-quick-item:hover {
      background-color: #f8fafc !important;
      transform: translateY(-1px);
    }
  `;
  document.head.appendChild(style);
}

// ===================== AnimatedNumber =====================
const AnimatedNumber: React.FC<{ value: number; duration?: number; prefix?: string; suffix?: string }> = ({
  value,
  duration = 800,
  prefix = '',
  suffix = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef<number | null>(null);
  const prevValueRef = useRef(0);

  useEffect(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    let startTime: number | null = null;
    const startValue = prevValueRef.current;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // cubic bezier easeOutExpo for smooth decel
      const eased = 1 - Math.pow(2, -10 * progress);
      const current = Math.round(startValue + (value - startValue) * eased);
      setDisplayValue(current);
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        prevValueRef.current = value;
      }
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [value]);

  return <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>;
};

// ===================== Chart Components =====================
const CHART_HEIGHT = 68;

const OrderTrendChart: React.FC = () => {
  const config = useMemo(() => ({
    data: mockOrderData.orderTrend,
    xField: 'date',
    yField: 'count',
    smooth: true,
    point: false,
    lineStyle: { lineWidth: 2 },
    areaStyle: { fill: 'l(270) 0:#e0e7ff 1:rgba(255,255,255,0)' },
    color: '#6366f1',
    animation: { appear: { animation: 'wave-in', duration: 800 } },
    xAxis: {
      label: { style: { fontSize: 9, fill: '#94a3b8' } },
      line: false,
      tickLine: false,
    },
    yAxis: {
      label: false,
      grid: { line: { style: { stroke: '#f1f5f9', lineWidth: 0.5, lineDash: [3, 3] } } },
      line: false,
      tickLine: false,
    },
    tooltip: {
      formatter: (datum: any) => ({ name: '订单数', value: datum.count }),
    },
    padding: [6, 4, 18, 4],
    autoFit: true,
  }), []);

  return <Line {...config} style={{ height: CHART_HEIGHT, width: '100%' }} />;
};

const FinanceChart: React.FC = () => {
  const transformedData = useMemo(() => {
    const result: { month: string; type: string; value: number }[] = [];
    mockFinanceData.monthlyData.forEach(item => {
      result.push({ month: item.month, type: '收入', value: item.revenue });
      result.push({ month: item.month, type: '支出', value: item.expense });
    });
    return result;
  }, []);

  const config = useMemo(() => ({
    data: transformedData,
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    isGroup: true,
    columnStyle: { radius: [2, 2, 0, 0] },
    color: ['#10b981', '#f59e0b'],
    animation: { appear: { animation: 'grow-in-y', duration: 800 } },
    xAxis: {
      label: { style: { fontSize: 9, fill: '#94a3b8' } },
      line: false,
      tickLine: false,
    },
    yAxis: {
      label: false,
      grid: { line: { style: { stroke: '#f1f5f9', lineWidth: 0.5, lineDash: [3, 3] } } },
      line: false,
      tickLine: false,
    },
    tooltip: {
      formatter: (datum: any) => ({ name: datum.type, value: `¥${(datum.value / 10000).toFixed(1)}万` }),
    },
    padding: [6, 4, 18, 4],
    legend: false,
    autoFit: true,
  }), [transformedData]);

  return <Column {...config} style={{ height: CHART_HEIGHT, width: '100%' }} />;
};

const UserPieChart: React.FC = () => {
  const config = useMemo(() => ({
    data: mockUserData.userDistribution,
    angleField: 'value',
    colorField: 'type',
    radius: 0.9,
    innerRadius: 0.72,
    label: false,
    legend: false,
    interactions: [{ type: 'element-active' }],
    color: ['#6366f1', '#ec4899'],
    animation: { appear: { animation: 'zoom-in', duration: 600 } },
    padding: [0, 0, 0, 0],
    autoFit: true,
    statistic: {
      title: false,
      content: {
        style: { fontSize: '11px', fontWeight: 600, color: '#475569', lineHeight: '1' },
        content: `${(mockUserData.totalUsers / 1000).toFixed(1)}k`,
      },
    },
  }), []);

  return <Pie {...config} style={{ height: 64, width: 64 }} />;
};

// ===================== Skeleton =====================
const WelcomeSkeleton: React.FC = () => (
  <PageContainer header={{ title: '' }}>
    {/* Header skeleton */}
    <div
      className="welcome-skeleton-pulse"
      style={{
        height: 56,
        borderRadius: 12,
        background: 'linear-gradient(135deg, #c4b5fd 0%, #d8b4fe 100%)',
        marginBottom: 10,
      }}
    />

    {/* Stat cards skeleton */}
    <Row gutter={[10, 10]} style={{ marginBottom: 10 }}>
      {[1, 2, 3, 4].map(i => (
        <Col xs={12} md={6} key={i}>
          <div
            className="welcome-skeleton-pulse"
            style={{
              height: 52,
              borderRadius: 10,
              backgroundColor: '#f1f5f9',
              animationDelay: `${i * 0.1}s`,
            }}
          />
        </Col>
      ))}
    </Row>

    {/* Chart cards skeleton */}
    <Row gutter={[10, 10]} style={{ marginBottom: 10 }}>
      <Col xs={24} lg={9}>
        <Card variant="outlined" styles={{ body: { padding: '12px' } }} style={{ borderRadius: 10, borderColor: '#f1f5f9' }}>
          <Skeleton.Input active size="small" style={{ width: 80, height: 14, marginBottom: 8 }} />
          <Row gutter={[4, 4]} style={{ marginBottom: 8 }}>
            {[1, 2, 3, 4].map(i => (
              <Col span={6} key={i}>
                <div style={{ height: 36, borderRadius: 6, backgroundColor: '#f8fafc' }} className="welcome-skeleton-pulse" />
              </Col>
            ))}
          </Row>
          <div style={{ height: CHART_HEIGHT, borderRadius: 6, backgroundColor: '#f8fafc' }} className="welcome-skeleton-pulse" />
        </Card>
      </Col>
      <Col xs={24} lg={9}>
        <Card variant="outlined" styles={{ body: { padding: '12px' } }} style={{ borderRadius: 10, borderColor: '#f1f5f9' }}>
          <Skeleton.Input active size="small" style={{ width: 80, height: 14, marginBottom: 8 }} />
          <Row gutter={[4, 4]} style={{ marginBottom: 8 }}>
            {[1, 2, 3].map(i => (
              <Col span={8} key={i}>
                <div style={{ height: 36, borderRadius: 6, backgroundColor: '#f8fafc' }} className="welcome-skeleton-pulse" />
              </Col>
            ))}
          </Row>
          <div style={{ height: CHART_HEIGHT, borderRadius: 6, backgroundColor: '#f8fafc' }} className="welcome-skeleton-pulse" />
        </Card>
      </Col>
      <Col xs={24} lg={6}>
        <Card variant="outlined" styles={{ body: { padding: '12px' } }} style={{ borderRadius: 10, borderColor: '#f1f5f9' }}>
          <Skeleton.Input active size="small" style={{ width: 60, height: 14, marginBottom: 8 }} />
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#f8fafc' }} className="welcome-skeleton-pulse" />
          </div>
          <div style={{ height: 80, borderRadius: 6, backgroundColor: '#f8fafc' }} className="welcome-skeleton-pulse" />
        </Card>
      </Col>
    </Row>

    {/* Quick actions skeleton */}
    <div style={{ height: 56, borderRadius: 10, backgroundColor: '#f1f5f9' }} className="welcome-skeleton-pulse" />
  </PageContainer>
);

// ===================== Main Component =====================
const Welcome: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartsReady, setChartsReady] = useState(false);
  const currentDate = getCurrentDate();

  const fetchWeatherData = async () => {
    try {
      let latitude = 39.9042;
      let longitude = 116.4074;
      let cityName = '北京';

      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000, enableHighAccuracy: false });
        });
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      } catch {
        // 使用默认位置
      }

      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m`
      );
      const weatherJson = await weatherRes.json();

      if (weatherJson.current) {
        const current = weatherJson.current;
        const weatherType = getWeatherTypeFromWMO(current.weather_code);

        if (latitude !== 39.9042) {
          try {
            const reverseRes = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=zh`
            );
            const reverseJson = await reverseRes.json();
            cityName = reverseJson.city || reverseJson.locality || reverseJson.principalSubdivision || '当前位置';
          } catch { /* ignore */ }
        }

        const windDirs = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
        const windDir = windDirs[Math.round(current.wind_direction_10m / 45) % 8];

        setWeatherData({
          city: cityName,
          temperature: Math.round(current.temperature_2m),
          weather: weatherType,
          humidity: Math.round(current.relative_humidity_2m),
          wind: `${windDir}风 ${Math.round(current.wind_speed_10m)}km/h`,
        });
        return;
      }
    } catch (error) {
      console.error('天气数据获取失败:', error);
    }

    setWeatherData({ city: '北京', temperature: 22, weather: 'cloudy', humidity: 55, wind: '微风' });
  };

  const fetchUserData = async () => {
    try {
      const response: any = await currentUserApi();
      if (response.code == '200') {
        setUserData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
      // 延迟显示图表，避免同时渲染导致卡顿
      requestAnimationFrame(() => {
        setTimeout(() => setChartsReady(true), 100);
      });
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchWeatherData();
  }, []);

  if (loading) return <WelcomeSkeleton />;

  return (
    <PageContainer header={{ title: '' }}>
      {/* ====== 顶部信息栏 ====== */}
      <Card
        variant="outlined"
        styles={{ body: { padding: '12px 16px' } }}
        className="welcome-fade-in"
        style={{
          borderRadius: 12,
          border: 'none',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          marginBottom: 10,
          boxShadow: '0 2px 12px rgba(102,126,234,0.2)',
        }}
      >
        <Row align="middle" gutter={12}>
          <Col flex="auto">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {userData?.avatar ? (
                  <img src={userData.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <UserOutlined style={{ fontSize: 20, color: 'rgba(255,255,255,0.8)' }} />
                )}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>
                  {currentDate.greeting}，{userData?.realName || '用户'}
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 3 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <MailOutlined style={{ fontSize: 10 }} />{userData?.username || '-'}
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <PhoneOutlined style={{ fontSize: 10 }} />{userData?.phone || '-'}
                  </span>
                </div>
              </div>
            </div>
          </Col>
          <Col>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CalendarOutlined style={{ fontSize: 11 }} />
                {currentDate.month}月{currentDate.day}日 {currentDate.weekDay}
              </span>
              {weatherData && (
                <>
                  <div style={{ width: 1, height: 14, backgroundColor: 'rgba(255,255,255,0.2)' }} />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {getWeatherIcon(weatherData.weather)}
                    {weatherData.temperature}°C {getWeatherLabel(weatherData.weather)}
                  </span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <EnvironmentOutlined style={{ fontSize: 9 }} />{weatherData.city} · 湿度{weatherData.humidity}%
                  </span>
                </>
              )}
            </div>
          </Col>
        </Row>
      </Card>

      {/* ====== 统计卡片 ====== */}
      <Row gutter={[10, 10]} style={{ marginBottom: 10 }}>
        {[
          { title: '今日订单', value: mockOrderData.todayOrders, icon: <ShoppingCartOutlined />, growth: mockOrderData.orderGrowth, color: '#6366f1', bg: '#eef2ff' },
          { title: '新增用户', value: mockUserData.todayNewUsers, icon: <UserOutlined />, growth: mockUserData.userGrowth, color: '#0ea5e9', bg: '#f0f9ff' },
          { title: '今日收入', value: Math.round(mockFinanceData.todayRevenue / 1000), icon: <WalletOutlined />, growth: mockFinanceData.revenueGrowth, color: '#10b981', bg: '#f0fdf4', suffix: 'k' },
          { title: '库存商品', value: mockProductData.inStockProducts, icon: <PauseOutlined />, color: '#f59e0b', bg: '#fffbeb' },
        ].map((item, idx) => (
          <Col xs={12} sm={12} md={6} key={idx}>
            <div
              className={`welcome-stat-card welcome-fade-in-d${idx + 1}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                backgroundColor: '#fff',
                borderRadius: 10,
                border: '1px solid #f1f5f9',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  backgroundColor: item.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span style={{ color: item.color, fontSize: 15 }}>{item.icon}</span>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1 }}>{item.title}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>
                    <AnimatedNumber value={item.value} />
                  </span>
                  {item.growth !== undefined && (
                    <span style={{ fontSize: 10, color: item.growth >= 0 ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: 1 }}>
                      {item.growth >= 0 ? <ArrowUpOutlined style={{ fontSize: 8 }} /> : <ArrowDownOutlined style={{ fontSize: 8 }} />}
                      {Math.abs(item.growth)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* ====== 核心数据区域 ====== */}
      <Row gutter={[10, 10]} style={{ marginBottom: 10 }}>
        {/* 业务概览 */}
        <Col xs={24} lg={9}>
          <Card
            variant="outlined"
            styles={{ body: { padding: '12px' } }}
            className="welcome-fade-in-d2"
            style={{ borderRadius: 10, borderColor: '#f1f5f9', height: '100%' }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
              <DashboardOutlined style={{ fontSize: 12, color: '#6366f1' }} />业务概览
            </div>
            <Row gutter={[4, 4]} style={{ marginBottom: 8 }}>
              {[
                { label: '总订单', value: mockOrderData.totalOrders, color: '#6366f1' },
                { label: '待处理', value: mockOrderData.pendingOrders, color: '#f59e0b' },
                { label: '总用户', value: mockUserData.totalUsers, color: '#10b981' },
                { label: '活跃', value: mockUserData.activeUsers, color: '#ec4899' },
              ].map((s, i) => (
                <Col span={6} key={i}>
                  <div style={{ textAlign: 'center', padding: '5px 2px', backgroundColor: `${s.color}08`, borderRadius: 6 }}>
                    <div style={{ fontSize: 9, color: '#94a3b8' }}>{s.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: s.color, marginTop: 1 }}>
                      <AnimatedNumber value={s.value} />
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
            <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>7日订单趋势</div>
            {chartsReady ? (
              <OrderTrendChart />
            ) : (
              <div style={{ height: CHART_HEIGHT, borderRadius: 6, backgroundColor: '#f8fafc' }} className="welcome-skeleton-pulse" />
            )}
          </Card>
        </Col>

        {/* 经营数据 */}
        <Col xs={24} lg={9}>
          <Card
            variant="outlined"
            styles={{ body: { padding: '12px' } }}
            className="welcome-fade-in-d3"
            style={{ borderRadius: 10, borderColor: '#f1f5f9', height: '100%' }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
              <WalletOutlined style={{ fontSize: 12, color: '#10b981' }} />经营数据
            </div>
            <Row gutter={[4, 4]} style={{ marginBottom: 8 }}>
              {[
                { label: '本月利润', value: mockFinanceData.profit, color: '#10b981', isMoney: true },
                { label: '本月支出', value: mockFinanceData.expense, color: '#f59e0b', isMoney: true },
                { label: '库存率', value: mockProductData.stockRate, color: '#6366f1' },
              ].map((s, i) => (
                <Col span={8} key={i}>
                  <div style={{ textAlign: 'center', padding: '5px 2px', backgroundColor: `${s.color}08`, borderRadius: 6 }}>
                    <div style={{ fontSize: 9, color: '#94a3b8' }}>{s.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: s.color, marginTop: 1 }}>
                      {s.isMoney ? <AnimatedNumber value={Math.round(s.value / 1000)} prefix="¥" suffix="k" /> : <AnimatedNumber value={s.value} suffix="%" />}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>
              <span>收支趋势</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <span style={{ width: 6, height: 2, borderRadius: 1, backgroundColor: '#10b981', display: 'inline-block' }} />收入
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <span style={{ width: 6, height: 2, borderRadius: 1, backgroundColor: '#f59e0b', display: 'inline-block' }} />支出
              </span>
            </div>
            {chartsReady ? (
              <FinanceChart />
            ) : (
              <div style={{ height: CHART_HEIGHT, borderRadius: 6, backgroundColor: '#f8fafc' }} className="welcome-skeleton-pulse" />
            )}
          </Card>
        </Col>

        {/* 用户分布 */}
        <Col xs={24} lg={6}>
          <Card
            variant="outlined"
            styles={{ body: { padding: '12px' } }}
            className="welcome-fade-in-d4"
            style={{ borderRadius: 10, borderColor: '#f1f5f9', height: '100%' }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
              <TeamOutlined style={{ fontSize: 12, color: '#ec4899' }} />用户分布
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
              {chartsReady ? (
                <UserPieChart />
              ) : (
                <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#f8fafc' }} className="welcome-skeleton-pulse" />
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 8 }}>
              {[
                { label: '男性', value: '52%', color: '#6366f1' },
                { label: '女性', value: '48%', color: '#ec4899' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#64748b' }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: item.color }} />
                  {item.label} {item.value}
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
              {[
                { label: '总用户', value: mockUserData.totalUsers.toLocaleString(), color: '#334155' },
                { label: '今日新增', value: `+${mockUserData.todayNewUsers}`, color: '#10b981' },
                { label: '活跃用户', value: mockUserData.activeUsers.toLocaleString(), color: '#6366f1' },
                { label: '不活跃', value: mockUserData.inactiveUsers.toString(), color: '#94a3b8' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 10 }}>
                  <span style={{ color: '#94a3b8' }}>{item.label}</span>
                  <span style={{ fontWeight: 600, color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* ====== 快捷操作栏 ====== */}
      <Card
        variant="outlined"
        styles={{ body: { padding: '10px 14px' } }}
        className="welcome-fade-in-d4"
        style={{ borderRadius: 10, borderColor: '#f1f5f9' }}
      >
        <Row align="middle" gutter={8}>
          <Col flex="auto">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#334155' }}>
              <ClockCircleOutlined style={{ fontSize: 12, color: '#6366f1' }} />
              快捷操作
            </div>
          </Col>
          <Col>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { icon: <ShoppingCartOutlined style={{ fontSize: 13, color: '#6366f1' }} />, label: '订单管理', path: '/order' },
                { icon: <TeamOutlined style={{ fontSize: 13, color: '#0ea5e9' }} />, label: '用户管理', path: '/user' },
                { icon: <FileTextOutlined style={{ fontSize: 13, color: '#10b981' }} />, label: '日志查看', path: '/log' },
                { icon: <SettingOutlined style={{ fontSize: 13, color: '#64748b' }} />, label: '系统设置', path: '/settings' },
              ].map((item, i) => (
                <Tooltip title={item.label} key={i}>
                  <div
                    className="welcome-quick-item"
                    onClick={() => history.push(item.path)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '5px 10px',
                      borderRadius: 6,
                      border: '1px solid #f1f5f9',
                      backgroundColor: '#fff',
                      fontSize: 11,
                      color: '#64748b',
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                </Tooltip>
              ))}
            </div>
          </Col>
        </Row>
      </Card>
    </PageContainer>
  );
};

export default Welcome;

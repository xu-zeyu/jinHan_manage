import { useModel } from '@umijs/max';
import { Card, Row, Col, Tooltip } from 'antd';
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
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekDay = weekDays[now.getDay()];
  const hours = now.getHours();
  let greeting = '早上好';
  if (hours >= 12 && hours < 14) greeting = '中午好';
  else if (hours >= 14 && hours < 18) greeting = '下午好';
  else if (hours >= 18) greeting = '晚上好';
  return { month, day, weekDay, greeting };
};

const getWeatherIcon = (type: string) => {
  switch (type) {
    case 'sunny':
      return <SunOutlined style={{ fontSize: 14, color: '#f59e0b' }} />;
    case 'rainy':
      return <CloudFilled style={{ fontSize: 14, color: '#3b82f6' }} />;
    default:
      return <CloudOutlined style={{ fontSize: 14, color: '#94a3b8' }} />;
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

// ===================== CSS Animations =====================
const styleId = 'welcome-animations';
if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
  const s = document.createElement('style');
  s.id = styleId;
  s.textContent = `
    @keyframes wFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes wPulse{0%,100%{opacity:1}50%{opacity:.5}}
    .w-fade{animation:wFadeUp .35s ease-out both}
    .w-fade-1{animation:wFadeUp .35s ease-out .04s both}
    .w-fade-2{animation:wFadeUp .35s ease-out .08s both}
    .w-fade-3{animation:wFadeUp .35s ease-out .12s both}
    .w-fade-4{animation:wFadeUp .35s ease-out .16s both}
    .w-pulse{animation:wPulse 1.4s ease-in-out infinite}
    .w-stat{transition:transform .2s,box-shadow .2s}
    .w-stat:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.07)!important}
    .w-quick{transition:all .15s;cursor:pointer}
    .w-quick:hover{background:#f8fafc!important;transform:translateY(-1px)}
  `;
  document.head.appendChild(s);
}

// ===================== AnimatedNumber =====================
const AnimatedNumber: React.FC<{
  value: number; duration?: number; prefix?: string; suffix?: string;
}> = ({ value, duration = 800, prefix = '', suffix = '' }) => {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>(0);
  const prevRef = useRef(0);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    let start: number | null = null;
    const from = prevRef.current;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const e = 1 - Math.pow(2, -10 * p);
      setDisplay(Math.round(from + (value - from) * e));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
      else prevRef.current = value;
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
};

// ===================== Chart Components (v2 API) =====================
const CHART_H = 100;

const OrderTrendChart: React.FC = () => {
  const config: any = useMemo(() => ({
    data: mockOrderData.orderTrend,
    xField: 'date',
    yField: 'count',
    shapeField: 'smooth',
    style: {
      lineWidth: 2,
      stroke: '#6366f1',
    },
    area: {
      style: {
        fill: 'linear-gradient(90deg, #e0e7ff 0%, rgba(255,255,255,0) 100%)',
        fillOpacity: 0.4,
      },
    },
    axis: {
      x: {
        label: { style: { fontSize: 10, fill: '#94a3b8' } },
        line: false,
        tick: false,
      },
      y: {
        label: false,
        grid: true,
        gridLineWidth: 0.5,
        gridStroke: '#f1f5f9',
        gridLineDash: [3, 3],
        line: false,
        tick: false,
      },
    },
    animate: { enter: { type: 'waveIn', duration: 600 } },
    height: CHART_H,
    autoFit: false,
    padding: [8, 8, 24, 8],
    legend: false,
    tooltip: { channel: 'y', name: '订单数' },
  }), []);

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <Line {...config} />
    </div>
  );
};

const FinanceChart: React.FC = () => {
  const config: any = useMemo(() => ({
    data: mockFinanceData.monthlyRevenue,
    xField: 'month',
    yField: 'value',
    colorField: 'type',
    group: true,
    style: {
      radiusTopLeft: 3,
      radiusTopRight: 3,
      maxWidth: 12,
    },
    scale: {
      color: { range: ['#10b981', '#f59e0b'] },
    },
    axis: {
      x: {
        label: { style: { fontSize: 10, fill: '#94a3b8' } },
        line: false,
        tick: false,
      },
      y: {
        label: false,
        grid: true,
        gridLineWidth: 0.5,
        gridStroke: '#f1f5f9',
        gridLineDash: [3, 3],
        line: false,
        tick: false,
      },
    },
    animate: { enter: { type: 'growInY', duration: 600 } },
    height: CHART_H,
    autoFit: false,
    padding: [8, 8, 24, 8],
    legend: false,
    tooltip: {
      items: [
        (d: any) => ({ name: d.type, value: `¥${(d.value / 10000).toFixed(1)}万` }),
      ],
    },
  }), []);

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <Column {...config} />
    </div>
  );
};

const UserPieChart: React.FC = () => {
  const config: any = useMemo(() => ({
    data: mockUserData.userDistribution,
    angleField: 'value',
    colorField: 'type',
    radius: 0.85,
    innerRadius: 0.65,
    label: false,
    legend: false,
    scale: {
      color: { range: ['#6366f1', '#ec4899'] },
    },
    animate: { enter: { type: 'waveIn', duration: 500 } },
    height: 72,
    width: 72,
    autoFit: false,
    padding: 0,
    tooltip: false,
    interaction: { elementHighlight: true },
    annotations: [
      {
        type: 'text',
        style: {
          text: `${(mockUserData.totalUsers / 1000).toFixed(1)}k`,
          x: '50%',
          y: '50%',
          textAlign: 'center',
          fontSize: 12,
          fontWeight: 600,
          fill: '#475569',
        },
      },
    ],
  }), []);

  return <Pie {...config} />;
};

// ===================== Skeleton =====================
const SkeletonBlock: React.FC<{ h: number; r?: number; mb?: number; style?: React.CSSProperties }> = ({
  h, r = 8, mb = 0, style,
}) => (
  <div
    className="w-pulse"
    style={{ height: h, borderRadius: r, backgroundColor: '#f1f5f9', marginBottom: mb, ...style }}
  />
);

const WelcomeSkeleton: React.FC = () => (
  <PageContainer header={{ title: '' }}>
    <SkeletonBlock h={52} r={12} mb={10} style={{ background: 'linear-gradient(135deg,#c4b5fd,#d8b4fe)' }} />
    <Row gutter={[10, 10]} style={{ marginBottom: 10 }}>
      {[0, 1, 2, 3].map(i => (
        <Col xs={12} md={6} key={i}>
          <SkeletonBlock h={50} r={10} style={{ animationDelay: `${i * 0.1}s` }} />
        </Col>
      ))}
    </Row>
    <Row gutter={[10, 10]} style={{ marginBottom: 10 }}>
      <Col xs={24} lg={9}>
        <Card variant="outlined" styles={{ body: { padding: 12 } }} style={{ borderRadius: 10, borderColor: '#f1f5f9' }}>
          <SkeletonBlock h={12} mb={8} style={{ width: 80 }} />
          <Row gutter={[4, 4]} style={{ marginBottom: 8 }}>
            {[0, 1, 2, 3].map(i => <Col span={6} key={i}><SkeletonBlock h={34} r={6} /></Col>)}
          </Row>
          <SkeletonBlock h={CHART_H} r={6} />
        </Card>
      </Col>
      <Col xs={24} lg={9}>
        <Card variant="outlined" styles={{ body: { padding: 12 } }} style={{ borderRadius: 10, borderColor: '#f1f5f9' }}>
          <SkeletonBlock h={12} mb={8} style={{ width: 80 }} />
          <Row gutter={[4, 4]} style={{ marginBottom: 8 }}>
            {[0, 1, 2].map(i => <Col span={8} key={i}><SkeletonBlock h={34} r={6} /></Col>)}
          </Row>
          <SkeletonBlock h={CHART_H} r={6} />
        </Card>
      </Col>
      <Col xs={24} lg={6}>
        <Card variant="outlined" styles={{ body: { padding: 12 } }} style={{ borderRadius: 10, borderColor: '#f1f5f9' }}>
          <SkeletonBlock h={12} mb={8} style={{ width: 60 }} />
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <SkeletonBlock h={72} style={{ width: 72, borderRadius: '50%' }} />
          </div>
          <SkeletonBlock h={72} r={6} />
        </Card>
      </Col>
    </Row>
    <SkeletonBlock h={44} r={10} />
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
      let lat = 39.9042, lng = 116.4074, city = '北京';
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) => {
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch { /* default */ }

      const r = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m`
      );
      const j = await r.json();
      if (j.current) {
        const c = j.current;
        if (lat !== 39.9042) {
          try {
            const gr = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=zh`);
            const gj = await gr.json();
            city = gj.city || gj.locality || gj.principalSubdivision || '当前位置';
          } catch { /* ignore */ }
        }
        const dirs = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
        setWeatherData({
          city,
          temperature: Math.round(c.temperature_2m),
          weather: getWeatherTypeFromWMO(c.weather_code),
          humidity: Math.round(c.relative_humidity_2m),
          wind: `${dirs[Math.round(c.wind_direction_10m / 45) % 8]}风 ${Math.round(c.wind_speed_10m)}km/h`,
        });
        return;
      }
    } catch { /* fallback */ }
    setWeatherData({ city: '北京', temperature: 22, weather: 'cloudy', humidity: 55, wind: '微风' });
  };

  const fetchUserData = async () => {
    try {
      const res: any = await currentUserApi();
      if (res.code == '200') setUserData(res.data);
    } catch { /* ignore */ }
    finally {
      setLoading(false);
      requestAnimationFrame(() => setTimeout(() => setChartsReady(true), 80));
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchWeatherData();
  }, []);

  if (loading) return <WelcomeSkeleton />;

  return (
    <PageContainer header={{ title: '' }}>
      {/* ====== Header ====== */}
      <Card
        variant="outlined"
        styles={{ body: { padding: '10px 16px' } }}
        className="w-fade"
        style={{
          borderRadius: 12, border: 'none',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          marginBottom: 10,
          boxShadow: '0 2px 10px rgba(102,126,234,0.2)',
        }}
      >
        <Row align="middle" gutter={12}>
          <Col flex="auto">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', flexShrink: 0,
              }}>
                {userData?.avatar
                  ? <img src={userData.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <UserOutlined style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)' }} />}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>
                  {currentDate.greeting}，{userData?.realName || '用户'}
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 2 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <MailOutlined style={{ fontSize: 10 }} />{userData?.username || '-'}
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <PhoneOutlined style={{ fontSize: 10 }} />{userData?.phone || '-'}
                  </span>
                </div>
              </div>
            </div>
          </Col>
          <Col>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <CalendarOutlined style={{ fontSize: 11 }} />
                {currentDate.month}月{currentDate.day}日 {currentDate.weekDay}
              </span>
              {weatherData && (
                <>
                  <div style={{ width: 1, height: 12, backgroundColor: 'rgba(255,255,255,0.2)' }} />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {getWeatherIcon(weatherData.weather)}
                    {weatherData.temperature}°C {getWeatherLabel(weatherData.weather)}
                  </span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>
                    <EnvironmentOutlined style={{ fontSize: 9, marginRight: 2 }} />{weatherData.city} · 湿度{weatherData.humidity}%
                  </span>
                </>
              )}
            </div>
          </Col>
        </Row>
      </Card>

      {/* ====== Stat Cards ====== */}
      <Row gutter={[10, 10]} style={{ marginBottom: 10 }}>
        {[
          { title: '今日订单', value: mockOrderData.todayOrders, icon: <ShoppingCartOutlined />, growth: mockOrderData.orderGrowth, color: '#6366f1', bg: '#eef2ff' },
          { title: '新增用户', value: mockUserData.todayNewUsers, icon: <UserOutlined />, growth: mockUserData.userGrowth, color: '#0ea5e9', bg: '#f0f9ff' },
          { title: '今日收入', value: Math.round(mockFinanceData.todayRevenue / 1000), icon: <WalletOutlined />, growth: mockFinanceData.revenueGrowth, color: '#10b981', bg: '#f0fdf4', suffix: 'k' },
          { title: '库存商品', value: mockProductData.inStockProducts, icon: <PauseOutlined />, color: '#f59e0b', bg: '#fffbeb' },
        ].map((item, idx) => (
          <Col xs={12} sm={12} md={6} key={idx}>
            <div
              className={`w-stat w-fade-${idx + 1}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', backgroundColor: '#fff',
                borderRadius: 10, border: '1px solid #f1f5f9',
              }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                backgroundColor: item.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span style={{ color: item.color, fontSize: 15 }}>{item.icon}</span>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1 }}>{item.title}</div>
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

      {/* ====== Charts Area ====== */}
      <Row gutter={[10, 10]} style={{ marginBottom: 10 }}>
        {/* 业务概览 */}
        <Col xs={24} lg={9}>
          <Card variant="outlined" styles={{ body: { padding: 12 } }} className="w-fade-2"
            style={{ borderRadius: 10, borderColor: '#f1f5f9', height: '100%' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
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
                  <div style={{ textAlign: 'center', padding: '4px 2px', backgroundColor: `${s.color}08`, borderRadius: 6 }}>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{s.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: s.color, marginTop: 1 }}>
                      <AnimatedNumber value={s.value} />
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>7日订单趋势</div>
            {chartsReady
              ? <OrderTrendChart />
              : <SkeletonBlock h={CHART_H} r={6} />}
          </Card>
        </Col>

        {/* 经营数据 */}
        <Col xs={24} lg={9}>
          <Card variant="outlined" styles={{ body: { padding: 12 } }} className="w-fade-3"
            style={{ borderRadius: 10, borderColor: '#f1f5f9', height: '100%' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
              <WalletOutlined style={{ fontSize: 12, color: '#10b981' }} />经营数据
            </div>
            <Row gutter={[4, 4]} style={{ marginBottom: 8 }}>
              {[
                { label: '本月利润', value: mockFinanceData.profit, color: '#10b981', isMoney: true },
                { label: '本月支出', value: mockFinanceData.expense, color: '#f59e0b', isMoney: true },
                { label: '库存率', value: mockProductData.stockRate, color: '#6366f1' },
              ].map((s, i) => (
                <Col span={8} key={i}>
                  <div style={{ textAlign: 'center', padding: '4px 2px', backgroundColor: `${s.color}08`, borderRadius: 6 }}>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{s.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: s.color, marginTop: 1 }}>
                      {s.isMoney
                        ? <AnimatedNumber value={Math.round(s.value / 1000)} prefix="¥" suffix="k" />
                        : <AnimatedNumber value={s.value} suffix="%" />}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>
              <span>收支趋势</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <span style={{ width: 8, height: 3, borderRadius: 1, backgroundColor: '#10b981', display: 'inline-block' }} />收入
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <span style={{ width: 8, height: 3, borderRadius: 1, backgroundColor: '#f59e0b', display: 'inline-block' }} />支出
              </span>
            </div>
            {chartsReady
              ? <FinanceChart />
              : <SkeletonBlock h={CHART_H} r={6} />}
          </Card>
        </Col>

        {/* 用户分布 */}
        <Col xs={24} lg={6}>
          <Card variant="outlined" styles={{ body: { padding: 12 } }} className="w-fade-4"
            style={{ borderRadius: 10, borderColor: '#f1f5f9', height: '100%' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
              <TeamOutlined style={{ fontSize: 12, color: '#ec4899' }} />用户分布
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
              {chartsReady
                ? <UserPieChart />
                : <SkeletonBlock h={72} style={{ width: 72, borderRadius: '50%' }} />}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 8 }}>
              {[
                { label: '男性', value: '52%', color: '#6366f1' },
                { label: '女性', value: '48%', color: '#ec4899' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#64748b' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: item.color }} />
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
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 11 }}>
                  <span style={{ color: '#94a3b8' }}>{item.label}</span>
                  <span style={{ fontWeight: 600, color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* ====== Quick Actions ====== */}
      <Card variant="outlined" styles={{ body: { padding: '8px 14px' } }} className="w-fade-4"
        style={{ borderRadius: 10, borderColor: '#f1f5f9' }}>
        <Row align="middle" gutter={8}>
          <Col flex="auto">
            <span style={{ fontSize: 12, fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: 5 }}>
              <ClockCircleOutlined style={{ fontSize: 12, color: '#6366f1' }} />快捷操作
            </span>
          </Col>
          <Col>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { icon: <ShoppingCartOutlined style={{ fontSize: 12, color: '#6366f1' }} />, label: '订单管理', path: '/order' },
                { icon: <TeamOutlined style={{ fontSize: 12, color: '#0ea5e9' }} />, label: '用户管理', path: '/user' },
                { icon: <FileTextOutlined style={{ fontSize: 12, color: '#10b981' }} />, label: '日志查看', path: '/log' },
                { icon: <SettingOutlined style={{ fontSize: 12, color: '#64748b' }} />, label: '系统设置', path: '/settings' },
              ].map((item, i) => (
                <Tooltip title={item.label} key={i}>
                  <div className="w-quick" onClick={() => history.push(item.path)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '4px 10px', borderRadius: 6,
                      border: '1px solid #f1f5f9', backgroundColor: '#fff',
                      fontSize: 11, color: '#64748b',
                    }}>
                    {item.icon}<span>{item.label}</span>
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

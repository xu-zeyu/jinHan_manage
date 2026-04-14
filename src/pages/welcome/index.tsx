import { useModel } from '@umijs/max';
import { Row, Col } from 'antd';
import React, { useEffect, useState } from 'react';
import { currentUserApi } from '@/services/api';
import { getDashboardSummary } from '@/services/dashboard';
import { ShoppingCartOutlined, UserOutlined, WalletOutlined, PauseOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import Header from './components/Header';
import StatCard from './components/StatCard';
import BusinessOverview from './components/BusinessOverview';
import FinanceOverview from './components/FinanceOverview';
import UserDistribution from './components/UserDistribution';
import WelcomeSkeleton from './components/Skeleton';
import { initAnimations, getWeatherTypeFromWMO } from './utils';
import type { UserData, WeatherData } from './types';
import type { DashboardSummaryVO } from '@/services/dashboard/types';

const Index: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [summaryData, setSummaryData] = useState<DashboardSummaryVO | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartsReady, setChartsReady] = useState(false);
  const [headerLoading, setHeaderLoading] = useState(true);

  const TIMEOUT_DURATION = 5000;

  useEffect(() => {
    initAnimations();
  }, []);

  const fetchWeatherData = async () => {
    return new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        setWeatherData({ city: '北京', temperature: 22, weather: 'cloudy', humidity: 55, wind: '微风' });
        resolve();
      }, TIMEOUT_DURATION);

      const fetchData = async () => {
        try {
          let lat = 39.9042, lng = 116.4074, city = '北京';
          try {
            const pos = await new Promise<GeolocationPosition>((res, rej) => {
              navigator.geolocation.getCurrentPosition(res, rej, { timeout: 3000 });
            });
            lat = pos.coords.latitude;
            lng = pos.coords.longitude;
          } catch { /* 使用默认位置 */ }

          const r = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m`,
            { signal: AbortSignal.timeout(TIMEOUT_DURATION) }
          );
          const j = await r.json();
          if (j.current) {
            const c = j.current;
            if (lat !== 39.9042) {
              try {
                const gr = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=zh`);
                const gj = await gr.json();
                city = gj.city || gj.locality || gj.principalSubdivision || '当前位置';
              } catch { /* 使用默认城市名 */ }
            }
            const dirs = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
            setWeatherData({
              city,
              temperature: Math.round(c.temperature_2m),
              weather: getWeatherTypeFromWMO(c.weather_code),
              humidity: Math.round(c.relative_humidity_2m),
              wind: `${dirs[Math.round(c.wind_direction_10m / 45) % 8]}风 ${Math.round(c.wind_speed_10m)}km/h`,
            });
          } else {
            throw new Error('No weather data');
          }
        } catch {
          setWeatherData({ city: '北京', temperature: 22, weather: 'cloudy', humidity: 55, wind: '微风' });
        } finally {
          clearTimeout(timeout);
          resolve();
        }
      };

      fetchData();
    });
  };

  const fetchUserData = async () => {
    return new Promise<void>((resolve) => {
      const defaultUserData = {
        createdTime: "",
        id: 0,
        lastLoginTime: "",
        position: "",
        role: undefined,
        updatedTime: "",
        realName: '用户', username: '-', phone: '-', avatar: null }
      const timeout = setTimeout(() => {
        setUserData(defaultUserData);
        resolve();
      }, TIMEOUT_DURATION);

      const fetchData = async () => {
        try {
          const res: any = await currentUserApi();
          if (res.code == '200') {
            setUserData(res.data);
          } else {
            throw new Error('API error');
          }
        } catch {
          setUserData(defaultUserData);
        } finally {
          clearTimeout(timeout);
          resolve();
        }
      };

      fetchData();
    });
  };

  const fetchSummaryData = async () => {
    return new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        resolve();
      }, TIMEOUT_DURATION);

      const fetchData = async () => {
        try {
          const res: any = await getDashboardSummary();
          if (res.code == '200') {
            setSummaryData(res.data);
          }
        } catch {
          // 使用mock数据作为fallback
        } finally {
          clearTimeout(timeout);
          resolve();
        }
      };

      fetchData();
    });
  };

  useEffect(() => {
    const fetchAllData = async () => {
      await Promise.all([
        fetchUserData(),
        fetchWeatherData(),
        fetchSummaryData(),
      ]);

      setTimeout(() => {
        setHeaderLoading(false);
      }, 100);
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      requestAnimationFrame(() => setTimeout(() => setChartsReady(true), 80));
    }, 800);

    return () => clearTimeout(timer);
  }, [headerLoading]);

  if (loading) return <WelcomeSkeleton />;

  const todayOrders = summaryData?.todayOrderCount ?? 0
  const todayNewUsers = summaryData?.todayNewUsers ?? 0;
  const todayIncome = Math.round((summaryData?.todayIncome || 0) / 1000);
  const onSaleProducts= summaryData?.onSaleProducts ?? 0

  return (
    <PageContainer
      header={{ title: '' }}
    >
      <Header
        userData={userData}
        weatherData={weatherData}
        isLoading={headerLoading}
      />

      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        <Col xs={12} sm={12} md={6}>
          <StatCard
            title="今日订单"
            value={todayOrders}
            icon={<ShoppingCartOutlined />}
            color="#6366f1"
            bg="#eef2ff"
          />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <StatCard
            title="新增用户"
            value={todayNewUsers}
            icon={<UserOutlined />}
            color="#0ea5e9"
            bg="#f0f9ff"
          />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <StatCard
            title="今日收入"
            value={todayIncome}
            icon={<WalletOutlined />}
            color="#10b981"
            bg="#f0fdf4"
            suffix="k"
          />
        </Col>
        <Col xs={12} sm={12} md={6}>
          <StatCard
            title="在售商品"
            value={onSaleProducts}
            icon={<PauseOutlined />}
            color="#f59e0b"
            bg="#fffbeb"
          />
        </Col>
      </Row>

      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        <Col xs={24} lg={9}>
          <BusinessOverview chartsReady={chartsReady} />
        </Col>
        <Col xs={24} lg={9}>
          <FinanceOverview chartsReady={chartsReady} />
        </Col>
        <Col xs={24} lg={6}>
          <UserDistribution chartsReady={chartsReady} />
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Index;

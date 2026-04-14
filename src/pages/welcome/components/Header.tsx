import React from 'react';
import { Row, Col } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { getCurrentDate, getWeatherIcon, getWeatherLabel, getHeaderBackground, getHeaderShadow } from '../utils';
import type { UserData, WeatherData } from '../types';
import HeaderSkeleton from './HeaderSkeleton';

interface HeaderProps {
  userData: UserData | null;
  weatherData: WeatherData | null;
  isLoading?: boolean;
}

const Header: React.FC<HeaderProps> = ({ userData, weatherData, isLoading = false }) => {
  if (isLoading) {
    return <HeaderSkeleton />;
  }

  const currentDate = getCurrentDate();
  const weatherType = weatherData?.weather || 'cloudy';
  const background = getHeaderBackground(weatherType, currentDate.timeOfDay);
  const shadow = getHeaderShadow(weatherType, currentDate.timeOfDay);

  return (
    <div
      className="w-fade"
      style={{
        borderRadius: 14,
        border: '1px solid rgba(255, 255, 255, 0.25)',
        background: `linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%), ${background}`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        marginBottom: 12,
        boxShadow: shadow,
        transition: 'all 0.5s ease',
        padding: '14px 20px',
      }}
    >
      <Row align="middle" gutter={16}>
        <Col flex="auto">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', flexShrink: 0,
            }}>
              {userData?.avatar
                ? <img src={userData.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <UserOutlined style={{ fontSize: 20, color: '#fff' }} />}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#fff', lineHeight: 1.3, textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>
                {currentDate.greeting}，{userData?.realName || '用户'}
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 4 }}>
                <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.75)', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <MailOutlined style={{ fontSize: 11 }} />{userData?.username || '-'}
                </span>
                <span style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.75)', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <PhoneOutlined style={{ fontSize: 11 }} />{userData?.phone || '-'}
                </span>
              </div>
            </div>
          </div>
        </Col>
        <Col>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.85)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <CalendarOutlined style={{ fontSize: 12 }} />
              {currentDate.month}月{currentDate.day}日 {currentDate.weekDay}
            </span>
            {weatherData && (
              <>
                <div style={{ width: 1, height: 14, backgroundColor: 'rgba(255, 255, 255, 0.3)' }} />
                <span style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.85)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {getWeatherIcon(weatherData.weather)}
                  {weatherData.temperature}°C {getWeatherLabel(weatherData.weather)}
                </span>
                <span style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.6)' }}>
                  <EnvironmentOutlined style={{ fontSize: 10, marginRight: 2 }} />{weatherData.city} · 湿度{weatherData.humidity}%
                </span>
              </>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Header;

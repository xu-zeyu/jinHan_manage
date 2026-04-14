import { SunOutlined, CloudFilled, CloudOutlined, MoonOutlined } from '@ant-design/icons';

export const getCurrentDate = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekDay = weekDays[now.getDay()];
  const hours = now.getHours();
  let greeting = '早上好';
  let timeOfDay = 'morning';
  if (hours >= 12 && hours < 14) {
    greeting = '中午好';
    timeOfDay = 'noon';
  } else if (hours >= 14 && hours < 18) {
    greeting = '下午好';
    timeOfDay = 'afternoon';
  } else if (hours >= 18 && hours < 22) {
    greeting = '晚上好';
    timeOfDay = 'evening';
  } else if (hours >= 22 || hours < 6) {
    greeting = '夜深了';
    timeOfDay = 'midnight';
  }
  return { month, day, weekDay, greeting, timeOfDay };
};

export const getHeaderBackground = (weather: string, timeOfDay: string) => {
  const backgrounds: Record<string, Record<string, string>> = {
    sunny: {
      morning: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
      noon: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 50%, #fbbf24 100%)',
      afternoon: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
      evening: 'linear-gradient(135deg, #fb923c 0%, #f97316 50%, #ea580c 100%)',
      midnight: 'linear-gradient(135deg, #4c1d95 0%, #3b0764 50%, #2d065e 100%)',
    },
    rainy: {
      morning: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
      noon: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)',
      afternoon: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)',
      evening: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 50%, #1e3a8a 100%)',
      midnight: 'linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 50%, #17172e 100%)',
    },
    cloudy: {
      morning: 'linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)',
      noon: 'linear-gradient(135deg, #94a3b8 0%, #64748b 50%, #475569 100%)',
      afternoon: 'linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)',
      evening: 'linear-gradient(135deg, #475569 0%, #334155 50%, #1e293b 100%)',
      midnight: 'linear-gradient(135deg, #334155 0%, #1e293b 50%, #0f172a 100%)',
    },
  };
  return backgrounds[weather]?.[timeOfDay] || '#fff';
};

export const getHeaderShadow = (weather: string, timeOfDay: string) => {
  const shadows: Record<string, Record<string, string>> = {
    sunny: {
      morning: '0 4px 20px rgba(251, 191, 36, 0.3)',
      noon: '0 4px 24px rgba(245, 158, 11, 0.35)',
      afternoon: '0 4px 20px rgba(217, 119, 6, 0.3)',
      evening: '0 4px 20px rgba(249, 115, 22, 0.3)',
      midnight: '0 4px 20px rgba(76, 29, 149, 0.3)',
    },
    rainy: {
      morning: '0 4px 20px rgba(59, 130, 246, 0.3)',
      noon: '0 4px 20px rgba(96, 165, 250, 0.3)',
      afternoon: '0 4px 20px rgba(37, 99, 235, 0.3)',
      evening: '0 4px 20px rgba(30, 58, 138, 0.3)',
      midnight: '0 4px 20px rgba(30, 58, 138, 0.35)',
    },
    cloudy: {
      morning: '0 4px 16px rgba(100, 116, 139, 0.25)',
      noon: '0 4px 16px rgba(148, 163, 184, 0.25)',
      afternoon: '0 4px 16px rgba(100, 116, 139, 0.25)',
      evening: '0 4px 16px rgba(71, 85, 105, 0.3)',
      midnight: '0 4px 20px rgba(30, 41, 59, 0.4)',
    },
  };
  return shadows[weather]?.[timeOfDay] || shadows.cloudy.evening;
};

export const getWeatherIcon = (type: string) => {
  switch (type) {
    case 'sunny':
      return <SunOutlined style={{ fontSize: 16, color: '#f59e0b' }} />;
    case 'rainy':
      return <CloudFilled style={{ fontSize: 16, color: '#3b82f6' }} />;
    default:
      return <CloudOutlined style={{ fontSize: 16, color: '#94a3b8' }} />;
  }
};

export const getWeatherLabel = (type: string) => {
  switch (type) {
    case 'sunny': return '晴';
    case 'rainy': return '雨';
    default: return '多云';
  }
};

export const getWeatherTypeFromWMO = (code: number): string => {
  if (code === 0 || code === 1) return 'sunny';
  if (code >= 51 || code === 45 || code === 48) return 'rainy';
  return 'cloudy';
};

export const initAnimations = () => {
  const styleId = 'welcome-animations';
  if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
    const s = document.createElement('style');
    s.id = styleId;
    s.textContent = `
      @keyframes wFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
      @keyframes wPulse{0%,100%{opacity:1}50%{opacity:.5}}
      .w-fade{animation:wFadeUp .4s ease-out both}
      .w-fade-1{animation:wFadeUp .4s ease-out .05s both}
      .w-fade-2{animation:wFadeUp .4s ease-out .1s both}
      .w-fade-3{animation:wFadeUp .4s ease-out .15s both}
      .w-fade-4{animation:wFadeUp .4s ease-out .2s both}
      .w-pulse{animation:wPulse 1.4s ease-in-out infinite}
      .w-stat{transition:transform .2s,box-shadow .2s}
      .w-stat:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.08)!important}
      .w-quick{transition:all .15s;cursor:pointer}
      .w-quick:hover{background:#f8fafc!important;transform:translateY(-1px)}
    `;
    document.head.appendChild(s);
  }
};

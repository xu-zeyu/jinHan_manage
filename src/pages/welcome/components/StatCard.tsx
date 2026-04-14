import React from 'react';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import AnimatedNumber from './AnimatedNumber';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  growth?: number;
  color: string;
  bg: string;
  suffix?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, growth, color, bg, suffix }) => {
  return (
    <div
      className="w-stat"
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px', backgroundColor: '#fff',
        borderRadius: 12, border: '1px solid #f1f5f9',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        backgroundColor: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <span style={{ color: color, fontSize: 18 }}>{icon}</span>
      </div>
      <div>
        <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.2 }}>{title}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginTop: 4 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>
            <AnimatedNumber value={value} suffix={suffix} />
          </span>
          {growth !== undefined && (
            <span style={{ fontSize: 11, color: growth >= 0 ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {growth >= 0 ? <ArrowUpOutlined style={{ fontSize: 9 }} /> : <ArrowDownOutlined style={{ fontSize: 9 }} />}
              {Math.abs(growth)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
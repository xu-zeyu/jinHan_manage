import React, { useMemo } from 'react';
import { Column } from '@ant-design/charts';
import { mockFinanceData } from '../mock';
import type { TrendPoint } from '@/services/dashboard/types';

interface FinanceChartProps {
  incomeTrend?: TrendPoint[];
}

const CHART_H = 160;

const FinanceChart: React.FC<FinanceChartProps> = ({ incomeTrend }) => {
  const data = useMemo(() => {
    if (incomeTrend && incomeTrend.length > 0) {
      return incomeTrend.map((item) => ({
        month: item.date,
        type: item.type || '收入',
        value: item.value,
      }));
    }
    return mockFinanceData.monthlyRevenue;
  }, [incomeTrend]);

  const config: any = useMemo(() => ({
    data,
    xField: 'month',
    yField: 'value',
    colorField: 'type',
    group: true,
    style: {
      radiusTopLeft: 4,
      radiusTopRight: 4,
      maxWidth: 14,
    },
    scale: {
      color: { range: ['#10b981', '#f59e0b'] },
    },
    axis: {
      x: {
        label: { style: { fontSize: 12, fill: '#64748b' } },
        line: false,
        tick: false,
        grid: false,
      },
      y: {
        label: { style: { fontSize: 11, fill: '#94a3b8' } },
        grid: true,
        gridLineWidth: 0.5,
        gridStroke: '#e2e8f0',
        gridLineDash: [4, 4],
        line: false,
        tick: false,
      },
    },
    animate: { enter: { type: 'growInY', duration: 700 } },
    height: CHART_H,
    autoFit: true,
    legend: {
      color: false,
      position: 'center',
      layout: 'horizontal',
      crossPadding: [8, 16],
      itemName: { style: { fontSize: 12, fill: '#64748b' } },
      itemMarker: { style: { r: 4 } },
    },
  }), [data]);

  return (
    <div style={{ width: '100%', height: CHART_H, display: 'flex', justifyContent: 'center' }}>
      <Column {...config} />
    </div>
  );
};

export default FinanceChart;

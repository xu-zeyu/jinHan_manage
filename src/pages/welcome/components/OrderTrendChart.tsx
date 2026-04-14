import React, { useMemo } from 'react';
import { Line } from '@ant-design/charts';
import { mockOrderData } from '../mock';
import type { TrendPoint } from '@/services/dashboard/types';

interface OrderTrendChartProps {
  orderTrend?: TrendPoint[];
}

const CHART_H = 160;

const OrderTrendChart: React.FC<OrderTrendChartProps> = ({ orderTrend }) => {
  const data = useMemo(() => {
    if (orderTrend && orderTrend.length > 0) {
      return orderTrend.map((item) => ({
        date: item.date,
        count: item.value,
      }));
    }
    return mockOrderData.orderTrend;
  }, [orderTrend]);

  const config: any = useMemo(() => ({
    data,
    xField: 'date',
    yField: 'count',
    shapeField: 'smooth',
    style: {
      lineWidth: 2.5,
      stroke: '#6366f1',
    },
    area: {
      style: {
        fill: 'linear-gradient(180deg, #e0e7ff 0%, rgba(255,255,255,0) 100%)',
        fillOpacity: 0.6,
      },
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
    animate: { enter: { type: 'waveIn', duration: 700 } },
    height: CHART_H,
    autoFit: true,
    legend: {
      title: false,
      color: false,
      position: 'center',
      layout: 'horizontal',
      crossPadding: [8, 12],
      itemName: { style: { fontSize: 12, fill: '#64748b' } },
      itemMarker: { style: { r: 4 } },
    },
    tooltip: {
      channel: 'y',
      name: '订单数',
      formatter: (datum: any) => ({ name: datum.date, value: `${datum.count} 单` })
    },
  }), [data]);

  return (
    <div style={{ width: '100%', height: CHART_H, display: 'flex', justifyContent: 'center' }}>
      <Line {...config} />
    </div>
  );
};

export default OrderTrendChart;
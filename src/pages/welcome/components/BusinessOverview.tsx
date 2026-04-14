import React, { useEffect, useState } from 'react';
import { Card, Row, Col } from 'antd';
import { DashboardOutlined } from '@ant-design/icons';
import AnimatedNumber from './AnimatedNumber';
import OrderTrendChart from './OrderTrendChart';
import { mockOrderData, mockUserData } from '../mock';
import { getBusinessOverview } from '@/services/dashboard';
import type { BusinessOverviewVO } from '@/services/dashboard/types';

interface BusinessOverviewProps {
  chartsReady: boolean;
}

const BusinessOverview: React.FC<BusinessOverviewProps> = ({ chartsReady }) => {
  const [businessData, setBusinessData] = useState<BusinessOverviewVO | null>(null);

  const fetchData = async () => {
    try {
      const res: any = await getBusinessOverview();
      if (res.code === '200') {
        setBusinessData(res.data);
      }
    } catch {
      // 使用mock数据作为fallback
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalOrders = businessData?.totalOrders ?? 0;
  const pendingOrders = businessData?.pendingOrders ?? 0;
  const totalUsers = businessData?.totalUsers ?? 0;
  const activeUsers = businessData?.activeUsers ?? 0;

  return (
    <Card
      variant="outlined"
      styles={{ body: { padding: 16 } }}
      className="w-fade-2"
      style={{ borderRadius: 12, borderColor: '#e2e8f0', height: '100%' }}
    >
      <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        <DashboardOutlined style={{ fontSize: 14, color: '#6366f1' }} />业务概览
      </div>
      <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
        {[
          { label: '总订单', value: totalOrders, color: '#6366f1' },
          { label: '待处理', value: pendingOrders, color: '#f59e0b' },
          { label: '总用户', value: totalUsers, color: '#10b981' },
          { label: '活跃', value: activeUsers, color: '#ec4899' },
        ].map((s, i) => (
          <Col span={6} key={i}>
            <div style={{ textAlign: 'center', padding: '10px 6px', backgroundColor: `${s.color}08`, borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: '#64748b' }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: s.color, marginTop: 4 }}>
                <AnimatedNumber value={s.value} />
              </div>
            </div>
          </Col>
        ))}
      </Row>
      {chartsReady ? <OrderTrendChart orderTrend={businessData?.orderTrend} /> : <div style={{ height: 160, backgroundColor: '#f8fafc', borderRadius: 8 }} />}
    </Card>
  );
};

export default BusinessOverview;

import React, { useEffect, useState } from 'react';
import { Card, Row, Col } from 'antd';
import { WalletOutlined } from '@ant-design/icons';
import AnimatedNumber from './AnimatedNumber';
import FinanceChart from './FinanceChart';
import { mockFinanceData, mockProductData } from '../mock';
import { getOperationData } from '@/services/dashboard';
import type { OperationDataVO } from '@/services/dashboard/types';

interface FinanceOverviewProps {
  chartsReady: boolean;
}

const FinanceOverview: React.FC<FinanceOverviewProps> = ({ chartsReady }) => {
  const [operationData, setOperationData] = useState<OperationDataVO | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res: any = await getOperationData();
        if (res.code === '200') {
          setOperationData(res.data);
        }
      } catch {
        // 使用mock数据作为fallback
      }
    };
    fetchData();
  }, []);

  const monthlyProfit = operationData?.monthlyProfit ?? mockFinanceData.profit;
  const monthlyExpense = operationData?.monthlyExpense ?? mockFinanceData.expense;
  const inventoryRate = operationData?.inventoryRate ? (operationData.inventoryRate * 100).toFixed(1) : mockProductData.stockRate;

  return (
    <Card
      variant="outlined"
      styles={{ body: { padding: 16 } }}
      className="w-fade-3"
      style={{ borderRadius: 12, borderColor: '#e2e8f0', height: '100%' }}
    >
      <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        <WalletOutlined style={{ fontSize: 14, color: '#10b981' }} />经营数据
      </div>
      <Row gutter={[10, 8]} style={{ marginBottom: 16 }}>
        {[
          { label: '本月利润', value: monthlyProfit, color: '#10b981', isMoney: true },
          { label: '本月支出', value: monthlyExpense, color: '#f59e0b', isMoney: true },
          { label: '库存率', value: Number(inventoryRate), color: '#6366f1' },
        ].map((s, i) => (
          <Col span={8} key={i}>
            <div style={{ textAlign: 'center', padding: '12px 8px', backgroundColor: `${s.color}08`, borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: '#64748b' }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: s.color, marginTop: 4 }}>
                {s.isMoney
                  ? <AnimatedNumber value={Math.round(s.value / 1000)} prefix="¥" suffix="k" />
                  : <AnimatedNumber value={s.value} suffix="%" />}
              </div>
            </div>
          </Col>
        ))}
      </Row>
      {chartsReady ? <FinanceChart incomeTrend={operationData?.incomeTrend} /> : <div style={{ height: 160, backgroundColor: '#f8fafc', borderRadius: 8 }} />}
    </Card>
  );
};

export default FinanceOverview;
import React, { useEffect, useState } from 'react';
import { Card } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import UserPieChart from './UserPieChart';
import { mockUserData } from '../mock';
import { getBusinessOverview, getUserDistribution } from '@/services/dashboard';
import type { BusinessOverviewVO, UserDistributionItemVO } from '@/services/dashboard/types';

interface UserDistributionProps {
  chartsReady: boolean;
}

const UserDistribution: React.FC<UserDistributionProps> = ({ chartsReady }) => {
  const [businessData, setBusinessData] = useState<BusinessOverviewVO | null>(null);
  const [userDistributionData, setUserDistributionData] = useState<UserDistributionItemVO[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [businessRes, distributionRes] = await Promise.all([
          getBusinessOverview(),
          getUserDistribution(),
        ]);
        if (businessRes.code === '200') {
          setBusinessData(businessRes.data);
        }
        if (distributionRes.code === '200') {
          setUserDistributionData(distributionRes.data);
        }
      } catch {
        // 使用mock数据作为fallback
      }
    };
    fetchData();
  }, []);

  const totalUsers = businessData?.totalUsers ?? mockUserData.totalUsers;
  const todayNewUsers = mockUserData.todayNewUsers;
  const activeUsers = businessData?.activeUsers ?? mockUserData.activeUsers;
  const inactiveUsers = mockUserData.inactiveUsers;

  return (
    <Card
      variant="outlined"
      styles={{ body: { padding: 14 } }}
      className="w-fade-4"
      style={{ borderRadius: 12, borderColor: '#e2e8f0', height: '100%' }}
    >
      <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        <TeamOutlined style={{ fontSize: 14, color: '#ec4899' }} />用户分布
      </div>
        {chartsReady ? <UserPieChart userDistribution={userDistributionData ?? undefined} /> : <div style={{ width: 180, height: 180, backgroundColor: '#f8fafc', borderRadius: '50%' }} />}
    </Card>
  );
};

export default UserDistribution;

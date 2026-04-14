import React, { useMemo } from 'react';
import { Pie } from '@ant-design/charts';
import { mockUserData } from '../mock';
import type { UserDistributionItemVO } from '@/services/dashboard/types';

interface UserPieChartProps {
  userDistribution?: UserDistributionItemVO[];
}

const UserPieChart: React.FC<UserPieChartProps> = ({ userDistribution }) => {
  const data = useMemo(() => {
    let sourceData = mockUserData.userDistribution;
    if (userDistribution && userDistribution.length > 0) {
      sourceData = userDistribution;
    }
    return sourceData;
  }, [userDistribution]);

  const config: any = useMemo(() => ({
    data,
    angleField: 'value',
    colorField: 'type',
    radius: 0.85,
    innerRadius: 0.6,
    label: false,
    legend: {
      color: {
        title: false,
        position: 'right',
        rowPadding: 5,
      },
      position: 'center',
      layout: 'horizontal',
    },
    scale: {
      color: { range: ['#6366f1', '#ec4899', '#10b981', '#f59e0b'] },
    },
    animate: { enter: { type: 'waveIn', duration: 600 } },
    height: 240,
    autoFit: true,
    tooltip: ({ type, value }: any) => {
      return { type, value };
    },
    interaction: {
      tooltip: {
        render: (e: any, { items }: any) => {
          return (
            <React.Fragment>
              {items.map((item: any) => {
                const { type, value, color } = item;
                return (
                  <div key={type} style={{ margin: 0, display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <span
                        style={{
                          display: 'inline-block',
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: color,
                          marginRight: 6,
                        }}
                      ></span>
                      <span>{type}</span>
                    </div>
                    <b>{value}</b>
                  </div>
                );
              })}
            </React.Fragment>
          );
        },
      },
    },
  }), [data]);

  return (
    <div style={{ width: '100%', height: 240, display: 'flex', justifyContent: 'center' }}>
      <Pie {...config} />
    </div>
  );
};

export default UserPieChart;

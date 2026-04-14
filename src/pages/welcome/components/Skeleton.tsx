import React from 'react';
import { Card, Row, Col } from 'antd';
import { PageContainer } from '@ant-design/pro-components';

const SkeletonBlock: React.FC<{ h: number; r?: number; mb?: number; style?: React.CSSProperties }> = ({
  h, r = 8, mb = 0, style,
}) => (
  <div
    className="w-pulse"
    style={{ height: h, borderRadius: r, backgroundColor: '#f1f5f9', marginBottom: mb, ...style }}
  />
);

const WelcomeSkeleton: React.FC = () => (
  <PageContainer header={{ title: '' }}>
    <SkeletonBlock h={60} r={14} mb={12} style={{ background: 'linear-gradient(135deg,#c4b5fd,#d8b4fe)' }} />
    <Row gutter={[10, 10]} style={{ marginBottom: 12 }}>
      {[0, 1, 2, 3].map(i => (
        <Col xs={12} md={6} key={i}>
          <SkeletonBlock h={60} r={12} style={{ animationDelay: `${i * 0.1}s` }} />
        </Col>
      ))}
    </Row>
    <Row gutter={[10, 10]} style={{ marginBottom: 12 }}>
      <Col xs={24} lg={9}>
        <Card variant="outlined" styles={{ body: { padding: 16 } }} style={{ borderRadius: 12, borderColor: '#e2e8f0', height: '100%' }}>
          <SkeletonBlock h={16} mb={12} style={{ width: 80 }} />
          <Row gutter={[6, 6]} style={{ marginBottom: 12 }}>
            {[0, 1, 2, 3].map(i => <Col span={6} key={i}><SkeletonBlock h={40} r={8} /></Col>)}
          </Row>
          <SkeletonBlock h={130} r={8} />
        </Card>
      </Col>
      <Col xs={24} lg={9}>
        <Card variant="outlined" styles={{ body: { padding: 16 } }} style={{ borderRadius: 12, borderColor: '#e2e8f0', height: '100%' }}>
          <SkeletonBlock h={16} mb={12} style={{ width: 80 }} />
          <Row gutter={[6, 6]} style={{ marginBottom: 12 }}>
            {[0, 1, 2].map(i => <Col span={8} key={i}><SkeletonBlock h={40} r={8} /></Col>)}
          </Row>
          <SkeletonBlock h={130} r={8} />
        </Card>
      </Col>
      <Col xs={24} lg={6}>
        <Card variant="outlined" styles={{ body: { padding: 16 } }} style={{ borderRadius: 12, borderColor: '#e2e8f0', height: '100%' }}>
          <SkeletonBlock h={16} mb={12} style={{ width: 60 }} />
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <SkeletonBlock h={90} style={{ width: 90, borderRadius: '50%' }} />
          </div>
          <SkeletonBlock h={110} r={8} />
        </Card>
      </Col>
    </Row>
    <SkeletonBlock h={52} r={12} />
  </PageContainer>
);

export default WelcomeSkeleton;
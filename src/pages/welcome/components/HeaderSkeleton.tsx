import React from 'react';
import { Row, Col } from 'antd';

const HeaderSkeleton: React.FC = () => {
  return (
    <div
      style={{
        borderRadius: 14,
        border: '1px solid rgba(255, 255, 255, 0.25)',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%), linear-gradient(135deg, #475569 0%, #334155 50%, #1e293b 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        marginBottom: 12,
        padding: '14px 20px',
        boxShadow: '0 4px 16px rgba(71, 85, 105, 0.3)',
      }}
    >
      <Row align="middle" gutter={16}>
        <Col flex="auto">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              className="w-pulse"
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
              }}
            />
            <div>
              <div
                className="w-pulse"
                style={{
                  height: 20,
                  width: 120,
                  borderRadius: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  marginBottom: 8,
                }}
              />
              <div style={{ display: 'flex', gap: 14 }}>
                <div
                  className="w-pulse"
                  style={{
                    height: 14,
                    width: 80,
                    borderRadius: 4,
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  }}
                />
                <div
                  className="w-pulse"
                  style={{
                    height: 14,
                    width: 80,
                    borderRadius: 4,
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  }}
                />
              </div>
            </div>
          </div>
        </Col>
        <Col>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <div
              className="w-pulse"
              style={{
                height: 16,
                width: 100,
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              }}
            />
            <div
              className="w-pulse"
              style={{
                height: 16,
                width: 120,
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              }}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default HeaderSkeleton;

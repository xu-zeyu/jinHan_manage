import React, { useState } from 'react';
import { Tag, Checkbox, Drawer } from 'antd';
import { CheckSquareOutlined, ClockCircleOutlined, CaretRightOutlined } from '@ant-design/icons';
import type {TodoItem, WeatherData} from '../types';
import { getCurrentDate, getHeaderBackground, getHeaderShadow } from '../utils';

interface TodoListProps {
  todos: TodoItem[];
  pendingCount: number;
  weatherData: WeatherData | null;
}

const TodoList: React.FC<TodoListProps> = ({ todos, pendingCount, weatherData }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { timeOfDay } = getCurrentDate();
  const weatherType = weatherData?.weather || 'cloudy';
  const background = getHeaderBackground(weatherType, timeOfDay);
  const shadow = getHeaderShadow(weatherType , timeOfDay);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return { bg: '#fef2f2', color: '#ef4444', border: '#fecaca' };
      case 'medium': return { bg: '#fffbeb', color: '#f59e0b', border: '#fde68a' };
      case 'low': return { bg: '#f0fdf4', color: '#10b981', border: '#bbf7d0' };
      default: return { bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db' };
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories = {
      order: { label: '订单', color: '#6366f1' },
      finance: { label: '财务', color: '#10b981' },
      product: { label: '商品', color: '#f59e0b' },
      user: { label: '用户', color: '#ec4899' },
      system: { label: '系统', color: '#64748b' },
    };
    // @ts-ignore
    return categories[category] || { label: category, color: '#6b7280' };
  };

  return (
    <>
      <div
        onClick={() => setIsExpanded(true)}
        style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 20px',
          borderRadius: 40,
          background: `${background}`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: shadow,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckSquareOutlined style={{ color: '#fff', fontSize: 16 }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>待办事项</div>
            <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.8)', marginTop: 1 }}>{pendingCount} 项待处理</div>
          </div>
        </div>
        {pendingCount > 0 && (
          <div style={{ padding: '4px 10px', borderRadius: 20, background: 'rgba(255, 255, 255, 0.95)', fontSize: 12, color: '#dc2626', fontWeight: 600 }}>
            {pendingCount}
          </div>
        )}
        <CaretRightOutlined style={{ color: '#fff', fontSize: 16 }} />
      </div>

      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%), ${background}`, backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckSquareOutlined style={{ color: '#fff', fontSize: 16 }} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b' }}>待办事项</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>{pendingCount} 项待处理</div>
            </div>
          </div>
        }
        placement='right'
        width={400}
        onClose={() => setIsExpanded(false)}
        open={isExpanded}
        maskStyle={{ background: 'rgba(0, 0, 0, 0.1)' }} styles={{
          wrapper: { position: 'absolute', top: 0, right: 0, bottom: 0, width: 400, background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderLeft: '1px solid rgba(255, 255, 255, 0.3)' },
          body: { padding: 16, paddingTop: 8, background: 'transparent' },
          header: { padding: 16, background: 'transparent', borderBottom: '1px solid rgba(0, 0, 0, 0.1)' },
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {todos.map((todo) => {
            const priorityStyle = getPriorityColor(todo.priority);
            const categoryInfo = getCategoryLabel(todo.category);
            return (
              <div
                key={todo.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: 14,
                  borderRadius: 12,
                  background: '#fff',
                  border: '1px solid #f1f5f9',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#e0e7ff';
                  e.currentTarget.style.background = '#faf5ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#f1f5f9';
                  e.currentTarget.style.background = '#fff';
                }}
              >
                <Checkbox checked={todo.status === 'completed'} disabled style={{ marginTop: 2 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      color: todo.status === 'completed' ? '#94a3b8' : '#334155',
                      fontWeight: 500,
                      textDecoration: todo.status === 'completed' ? 'line-through' : 'none',
                      wordBreak: 'break-all',
                    }}
                  >
                    {todo.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                    <Tag color={categoryInfo.color} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4 }}>
                      {categoryInfo.label}
                    </Tag>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#94a3b8' }}>
                      <ClockCircleOutlined style={{ fontSize: 11 }} />
                      {todo.dueDate || '无截止日期'}
                    </span>
                  </div>
                </div>
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: priorityStyle.color, marginTop: 6 }} />
              </div>
            );
          })}
        </div>

        {todos.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
            <CheckSquareOutlined style={{ fontSize: 48, color: '#cbd5e1', marginBottom: 12 }} />
            <div style={{ fontSize: 14 }}>暂无待办事项</div>
          </div>
        )}
      </Drawer>
    </>
  );
};

export default TodoList;

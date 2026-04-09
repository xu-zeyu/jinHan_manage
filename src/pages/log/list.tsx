import { Button, Popconfirm, Space, Tag, Tooltip, Modal, App } from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {ProTable, ProDescriptions, ProColumns, PageContainer, type ActionType} from '@ant-design/pro-components';
import { useAccess } from 'umi';
import {useRef, useState} from 'react';
import { AdminAccess } from '@/common/data';
import type { LogVO } from '@/services/log/types';
import {deleteLog, getLogList} from "@/services/log";

const LogList: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const access = useAccess();
  const { message } = App.useApp();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentLog, setCurrentLog] = useState<LogVO | null>(null);


  // 表格列配置
  const columns: ProColumns<LogVO>[] = [
    {
      title: '基本信息',
      key: 'basicInfo',
      width: 300,
      search: false,
      render: (_: any, record: LogVO) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.operator}</div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
            <Tag  color={
              record.requestMethod === 'GET' ? 'green' :
              record.requestMethod === 'POST' ? 'blue' :
              record.requestMethod === 'PUT' ? 'orange' :
              record.requestMethod === 'DELETE' ? 'red' :
              'default'
            }>
              {record.operationType}
            </Tag>
          </div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
            {record.description}
          </div>
        </div>
      ),
    },
    {
      title: '请求信息',
      key: 'requestInfo',
      width: 350,
      search: false,
      ellipsis: true,
      render: (_: any, record: LogVO) => (
        <div>
          <div style={{ fontSize: '13px' }}>
            <span style={{ fontWeight: '500' }}>{record.requestMethod}</span>
            <span style={{ marginLeft: '8px', color: '#666' }}>{record.requestUrl}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
            IP: {record.ip}
          </div>
        </div>
      ),
    },
    {
      title: '执行信息',
      key: 'executeInfo',
      search: false,
      width: 200,
      render: (_: any, record: LogVO) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Tag  color={record.success ? 'green' : 'red'}>
              {record.success ? '成功' : '失败'}
            </Tag>
            <span style={{ fontSize: '12px', color: '#666' }}>{record.executeTime}ms</span>
          </div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
            {record.operateTime}
          </div>
        </div>
      ),
      filters: [
        {
          text: '成功',
          value: true,
        },
        {
          text: '失败',
          value: false,
        },
      ],
      onFilter: (value: any, record: LogVO) => record.success === value,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      search: false,
      render: (_: any, record: LogVO) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                setCurrentLog(record);
                setModalVisible(true);
              }}
            />
          </Tooltip>
          {access[AdminAccess.LOG_LIST_DELETE] && (
            <Popconfirm
              title="确定要删除这条日志吗？"
              onConfirm={() => {
                deleteLog({ id: record.id }).then(() => {
                  message.success('删除成功');
                  actionRef.current?.reload();
                });
              }}
            >
              <Tooltip title="删除日志">
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
    {
      title: '操作人',
      key: 'operator',
      search: true,
      hideInTable: true,
    },

    {
      title: '操作类型',
      key: 'operationType',
      search: true,
      hideInTable: true,
    },
    {
      title: '请求方法',
      key: 'requestMethod',
      valueEnum: {
        GET: {
          text: 'GET',
        },
        POST: {
          text: 'POST',
        },
        PUT: {
          text: 'PUT',
        },
        DELETE: {
          text: 'DELETE',
        },
      },
      search: true,
      hideInTable: true,
    },
    {
      title: '操作结果',
      key: 'success',
      valueEnum: {
        true: {
          text: '成功',
        },
        false: {
          text: '失败',
        },
      },
      search: true,
      hideInTable: true,
    },
  ];

  return (
    <PageContainer>
      <ProTable<LogVO>
        actionRef={actionRef}
        columns={columns}
        request={async (params) => {
          const { current, pageSize, ...rest } = params;
          const response = await getLogList({
            page: current || 1,
            size: pageSize || 10,
            ...rest,
          });
          return {
            data: response.data?.records || [],
            success: response.code === '200',
            total: response.data?.total || 0,
          };
        }}
        rowKey="id"
        pagination={{
          pageSize: 10,
          pageSizeOptions: ['10', '20', '50', '100'],
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
        search={{
          labelWidth: 100,
        }}
        options={{
          density: true,
          fullScreen: true,
          reload: true,
          setting: true,
        }}
        tableAlertRender={({ selectedRowKeys }) => (
          <div>
            已选择 {selectedRowKeys.length} 项
          </div>
        )}
        tableAlertOptionRender={({ selectedRowKeys }) => (
          <Space>
            {access[AdminAccess.LOG_LIST_DELETE] && selectedRowKeys.length > 0 && (
              <Popconfirm
                title={`确定要删除这 ${selectedRowKeys.length} 条日志吗？`}
                onConfirm={() => {
                  deleteLog({ ids: selectedRowKeys.map(key => Number(key)) }).then(() => {
                    message.success('删除成功');
                    setSelectedRowKeys([]);
                    actionRef.current?.reload();
                  });
                }}
              >
                <Button danger>批量删除</Button>
              </Popconfirm>
            )}
          </Space>
        )}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
      />
      <Modal
        title="日志详情"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        <div style={{ maxHeight: 500, overflowY: 'auto' }}>
          {currentLog && (
            <ProDescriptions
              title="详细信息"
              column={2}
              bordered
              dataSource={{
                operator: currentLog.operator,
                operationType: currentLog.operationType,
                description: currentLog.description,
                requestUrl: currentLog.requestUrl,
                requestMethod: currentLog.requestMethod,
                ip: currentLog.ip,
                operateTime: currentLog.operateTime,
                executeTime: currentLog.executeTime,
                success: currentLog.success ? '成功' : '失败',
                requestParams: currentLog.requestParams || '-',
                responseResult: currentLog.responseResult || '-',
                errorMessage: currentLog.errorMessage || '-',
              }}
              columns={[
                {
                  title: '操作人',
                  dataIndex: 'operator',
                },
                {
                  title: '操作类型',
                  dataIndex: 'operationType',
                },
                {
                  title: '操作描述',
                  dataIndex: 'description',
                },
                {
                  title: '请求URL',
                  dataIndex: 'requestUrl',
                },
                {
                  title: '请求方法',
                  dataIndex: 'requestMethod',
                },
                {
                  title: 'IP地址',
                  dataIndex: 'ip',
                },
                {
                  title: '操作时间',
                  dataIndex: 'operateTime',
                },
                {
                  title: '执行时长',
                  dataIndex: 'executeTime',
                },
                {
                  title: '操作结果',
                  dataIndex: 'success',
                },
                {
                  title: '请求参数',
                  dataIndex: 'requestParams',
                  valueType: 'textarea',
                  span: 2,
                },
                {
                  title: '响应结果',
                  dataIndex: 'responseResult',
                  valueType: 'textarea',
                  span: 2,
                },
                {
                  title: '错误信息',
                  dataIndex: 'errorMessage',
                  valueType: 'textarea',
                  span: 2,
                },
              ]}
            />
          )}
        </div>
      </Modal>
    </PageContainer>
  );
};

export default LogList;

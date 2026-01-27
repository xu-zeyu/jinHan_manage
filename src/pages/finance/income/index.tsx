import React, { useState, useRef } from 'react';
import { PageContainer, ProTable, ProColumns, ActionType, ProFormInstance } from '@ant-design/pro-components';
import { Button, Modal, Form, Input, InputNumber, message, Space, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { getIncomeRecordPage, createIncomeRecord, updateIncomeRecord, deleteIncomeRecord, confirmPayment } from '@/services/finance';
import type {IncomeRecordPageParams, IncomeRecordVO, IncomeRecordCreateParams} from '@/services/finance/types';
import AccessBtnAuth from "@/components/AccessBtnAuth";
import {AdminAccess} from "@/common/data";

interface IncomeRecord extends IncomeRecordVO {}

const FinanceIncome: React.FC = () => {
  const { modal, message: appMessage } = App.useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<IncomeRecord | null>(null);
  const actionRef = useRef<ActionType>(null);
  const [form] = Form.useForm();

  const columns: ProColumns<IncomeRecord>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      search: false,
    },
    {
      title: '收入来源',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (text: any) => {
        const type = text?.toString();
        if (type === 'PRODUCT_CAT_SALE' || type === 'PRODUCT_DOG_SALE') {
          return '商品销售';
        }
        if (type === 'SERVICE_FEE') {
          return '寄养服务';
        }
        if (type === 'ORDER_INCOME') {
          return '订单收入';
        }
        if (type === 'PRODUCT_SALE') {
          return '产品销售';
        }
        if (type === 'OTHER_INCOME') {
          return '其他收入';
        }
        return type || '-';
      },
    },
    {
      title: '金额',
      dataIndex: 'money',
      key: 'money',
      width: 80,
      render: (text) => <span style={{ color: '#3f8600' }}>¥{Number(text).toFixed(2)}</span>,
    },
    {
      title: '描述',
      dataIndex: 'described',
      key: 'described',
      search: false,
      ellipsis: true,
      width: 80,
    },
    {
      title: '关联订单',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 200,
      render: (text) => text || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdTime',
      key: 'createdTime',
      width: 180,
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      valueEnum: {
        'PENDING_REVIEW': { text: '待审核', status: 'Processing' },
        'CONFIRMED': { text: '已确认', status: 'Success' },
        'REJECTED': { text: '已拒绝', status: 'Error' },
      },
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      width: 240,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space size={0}>
          <AccessBtnAuth authority={AdminAccess.FINANCE_INCOME_LIST}>
          <Button
            key="view"
            type="link"
            size="small"
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          </AccessBtnAuth>
          <AccessBtnAuth authority={AdminAccess.FINANCE_INCOME_UPDATE}>
            <Button
              key="edit"
              type="link"
              size="small"
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          </AccessBtnAuth>
          {
            record.status ===  'PENDING_REVIEW' && <AccessBtnAuth authority={AdminAccess.FINANCE_INCOME_AUDIT}>
              <Button
                key="audit"
                type="link"
                size="small"
                onClick={() => handlePass(record)}
              >
                审核通过
              </Button>
            </AccessBtnAuth>
          }

          <AccessBtnAuth authority={AdminAccess.FINANCE_INCOME_DELETE}>
            <Button
              key="delete"
              type="link"
              size="small"
              danger
              onClick={() => handleDelete(record)}
            >
              删除
            </Button>
          </AccessBtnAuth>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleView = (record: IncomeRecord) => {
    const getTypeText = (type: any) => {
      const typeStr = type?.toString();
      if (typeStr === 'PRODUCT_CAT_SALE' || typeStr === 'PRODUCT_DOG_SALE') {
        return '商品销售';
      }
      if (typeStr === 'SERVICE_FEE') {
        return '寄养服务';
      }
      if (typeStr === 'ORDER_INCOME') {
        return '订单收入';
      }
      if (typeStr === 'PRODUCT_SALE') {
        return '产品销售';
      }
      if (typeStr === 'OTHER_INCOME') {
        return '其他收入';
      }
      return typeStr || '-';
    };

    const getStatusText = (status: any) => {
      const statusMap: Record<string, string> = {
        'PENDING_REVIEW': '待审核',
        'CONFIRMED': '已确认',
        'REJECTED': '已拒绝',
      };
      return statusMap[status?.toString() || ''] || status || '-';
    };

    modal.info({
      title: '收入详情',
      content: (
        <div style={{ padding: '16px 0', maxWidth: '100%' }}>
          <p><strong>ID：</strong>{record.id}</p>
          <p><strong>收入来源：</strong>{getTypeText(record.type)}</p>
          <p><strong>金额：</strong>¥{Number(record.money).toFixed(2)}</p>
          <p><strong>描述：</strong>{record.described}</p>
          <p><strong>关联订单：</strong>{record.orderId || '-'}</p>
          <p><strong>状态：</strong>{getStatusText(record.status)}</p>
          <p><strong>创建时间：</strong>{record.createdTime}</p>
          {record.evidenceUrl && (
            <p><strong>凭证：</strong><a href={record.evidenceUrl} target="_blank" rel="noopener noreferrer">查看凭证</a></p>
          )}
        </div>
      ),
      width: 600,
      style: { maxWidth: '90vw' },
    });
  };

  const handleEdit = (record: IncomeRecord) => {
    setEditingRecord(record);
    // 设置表单初始值
    form.setFieldsValue({
      type: record.type,
      money: record.money,
      described: record.described,
    });
    setModalVisible(true);
  };

  const handleDelete = (record: IncomeRecord) => {
    modal.confirm({
      title: '删除收入记录',
      content: `确定要删除收入记录 ID: ${record.id} 吗？`,
      onOk: async () => {
        try {
          await deleteIncomeRecord(record.id);
          appMessage.success('删除成功');
          actionRef.current?.reload();
        } catch (error) {
          appMessage.error('删除失败');
        }
      },
    });
  };

  const handlePass = (record: IncomeRecord) => {
    modal.confirm({
      title: '审核通过收入记录',
      content: `确定要审核通过收入记录 ID: ${record.id} 吗？`,
      onOk: async () => {
        try {
          // 调用确认付款接口进行审核
          await confirmPayment({
            orderId: record.orderId || '',
            orderAmount: record.money,
            paymentMethod: 'MANUAL_AUDIT', // 手动审核
            reviewedBy: 1, // 这里需要获取当前登录用户的ID
          },record.id);
          appMessage.success('审核通过成功');
          actionRef.current?.reload();
        } catch (error) {
        }
      },
    });
  };

  const handleSave = async (values: any) => {
    try {
      if (editingRecord) {
        // 更新收入记录
        const updateParams: IncomeRecordCreateParams = {
          type: values.type,
          money: values.money,
          described: values.described,
        };
        await updateIncomeRecord(editingRecord.id, updateParams);
        message.success('更新成功');
      } else {
        // 创建收入记录
        const createParams: IncomeRecordCreateParams = {
          type: values.type,
          money: values.money,
          described: values.described,
        };
        await createIncomeRecord(createParams);
        message.success('创建成功');
      }
      setModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    }
  };

  /**
   * 获取列表数据
   */
  const fetchIncomeRecordList = async (params: any) => {
    const requestParams: IncomeRecordPageParams = {
      page: params.current,
      size: params.pageSize,
      type: params.type,
      status: params.status,
    };

    try {
      const response: any = await getIncomeRecordPage(requestParams);
      return {
        data: response.data?.records || [],
        success: response.code === '200',
        total: response.data?.total || 0,
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };
  return (
    <PageContainer>
      <ProTable<IncomeRecord>
        columns={columns}
        actionRef={actionRef}
        request={fetchIncomeRecordList}
        rowKey="id"
        search={{
          labelWidth: 100,
        }}
        options={{
          density: true,
          fullScreen: true,
          reload: true,
          setting: true,
        }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          position: ['bottomCenter'],
          pageSizeOptions: [10, 20, 50],
          showTotal: (total, range) => `共 ${total} 条`,
        }}
        toolBarRender={() => [
          <AccessBtnAuth authority={AdminAccess.FINANCE_INCOME_CREATE} key="create">
            <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              创建收入
            </Button>
          </AccessBtnAuth>,
        ]}
      />

      <Modal
        title={editingRecord ? '编辑收入' : '创建收入'}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => setModalVisible(false)}
        destroyOnHidden
      >
        <Form form={form} onFinish={handleSave} layout="vertical">
          <Form.Item
            name="type"
            label="收入来源类型"
            rules={[{ required: true, message: '请选择收入来源类型' }]}
          >
            <select style={{ width: '100%', height: '32px', border: '1px solid #d9d9d9', borderRadius: '6px' }}>
              <option value="">请选择</option>
              <option value="ORDER_INCOME">订单收入</option>
              <option value="PRODUCT_SALE">产品销售</option>
              <option value="SERVICE_FEE">服务费用</option>
              <option value="OTHER_INCOME">其他收入</option>
            </select>
          </Form.Item>
          <Form.Item
            name="money"
            label="金额"
            rules={[{ required: true, message: '请输入金额' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入金额"
              min={0}
              precision={2}
              prefix="¥"
            />
          </Form.Item>
          <Form.Item
            name="described"
            label="描述"
            rules={[{ required: false, message: '请输入描述' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入收入描述（可选，留空将使用默认描述）" />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default FinanceIncome;

import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import {Button, Modal, Tag, Space, App, Descriptions, Form, Radio, message, Upload, Input} from 'antd';
import { EyeOutlined, PayCircleOutlined, UploadOutlined, DeliveredProcedureOutlined } from '@ant-design/icons';
import ImgUpload from '@/components/ImgUpload';
import React, { useRef, useState } from 'react';
import { useIntl } from '@umijs/max';
import { getOrderPage, getOrderById, cancelOrder, completeOrder, payOrder, affirmOrder, shipOrder } from '@/services/order';
import type { OrderVO, OrderPageParams } from '@/services/order/types';
import { OrderStatusEnum, PaymentMethodEnum } from '@/services/order/types';
import AccessBtnAuth from '@/components/AccessBtnAuth';
import { AdminAccess } from '@/common/data';
import OrderShipModal from './components/OrderShipModal';

const OrderList: React.FC = () => {
  const intl = useIntl();
  const { modal } = App.useApp();
  const actionRef = useRef<ActionType>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailOrder, setDetailOrder] = useState<OrderVO | null>(null);
  const [currentOrder, setCurrentOrder] = useState<OrderVO | null>(null);
  const [payForm] = Form.useForm();

  /**
   * 获取订单状态标签
   */
  const getOrderStatusTag = (status: OrderStatusEnum) => {
    const statusMap = {
      [OrderStatusEnum.PENDING_PAYMENT]: { text: '待付款', color: 'orange' },
      [OrderStatusEnum.PAID]: { text: '财务审核', color: 'orange' },
      [OrderStatusEnum.PENDING_CONFIRM]: { text: '待确认', color: 'gold' },
      [OrderStatusEnum.PROCESSING]: { text: '处理中', color: 'blue' },
      [OrderStatusEnum.PENDING_SHIP]: { text: '待发货', color: 'purple' },
      [OrderStatusEnum.SHIPPED]: { text: '已发货', color: 'cyan' },
      [OrderStatusEnum.COMPLETED]: { text: '已完成', color: 'green' },
      [OrderStatusEnum.CLOSED]: { text: '已取消', color: 'red' },
    };
    const config = statusMap[status] || { text: '未知', color: 'default' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  /**
   * 获取支付方式文本
   */
  const getPaymentMethodText = (method: PaymentMethodEnum | undefined) => {
    if (!method) return '未支付';
    const methodMap = {
      [PaymentMethodEnum.BANK]: '银行转账',
      [PaymentMethodEnum.ALIPAY]: '支付宝',
      [PaymentMethodEnum.WECHAT]: '微信支付',
    };
    return methodMap[method] || '未知';
  };

  /**
   * 表格列配置
   */
  const columns: ProColumns<OrderVO>[] = [
    {
      title: '订单号',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 180,
      search: true,
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        [OrderStatusEnum.PENDING_PAYMENT]: { text: '待付款', status: 'Warning' },
        [OrderStatusEnum.PAID]: { text: '财务审核', status: 'Warning' },
        [OrderStatusEnum.PENDING_CONFIRM]: { text: '待确认', status: 'Processing' },
        [OrderStatusEnum.PROCESSING]: { text: '处理中', status: 'Processing' },
        [OrderStatusEnum.PENDING_SHIP]: { text: '待发货', status: 'Processing' },
        [OrderStatusEnum.SHIPPED]: { text: '已发货', status: 'Processing' },
        [OrderStatusEnum.COMPLETED]: { text: '已完成', status: 'Success' },
        [OrderStatusEnum.CLOSED]: { text: '已取消', status: 'Error' },
      },
      render: (_, record) => getOrderStatusTag(record.status),
    },
    {
      title: '订单金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 100,
      render: (_, record) => (
        <span style={{ fontWeight: 600, color: '#ff4d4f' }}>¥{record.totalAmount?.toFixed(2) || '0.00'}</span>
      ),
    },
    {
      title: '支付方式',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 100,
      render: (_, record) => getPaymentMethodText(record.paymentMethod),
    },
    {
      title: '收货地址',
      dataIndex: 'address',
      key: 'address',
      width: 200,
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdTime',
      key: 'createdTime',
      width: 150,
      valueType: 'dateTime',
      sorter: true,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      width: 180,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space size={0}>
          <AccessBtnAuth authority={AdminAccess.ORDER_LIST_VIEW}>
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              style={{ padding: '0 4px' }}
              onClick={() => handleViewDetail(record)}
            >
              详情
            </Button>
          </AccessBtnAuth>
          {record.status === OrderStatusEnum.PENDING_PAYMENT && (
            <>
              <AccessBtnAuth authority={AdminAccess.ORDER_LIST_PAY}>
                <Button
                  type="link"
                  size="small"
                  style={{ padding: '0 4px' }}
                  onClick={() => handlePay(record)}
                >
                  付款
                </Button>
              </AccessBtnAuth>
              <AccessBtnAuth authority={AdminAccess.ORDER_LIST_CANCEL}>
                <Button
                  type="link"
                  size="small"
                  danger
                  style={{ padding: '0 4px' }}
                  onClick={() => handleCancel(record)}
                >
                  取消
                </Button>
              </AccessBtnAuth>
            </>
          )}
          {record.status === OrderStatusEnum.PENDING_CONFIRM && (
            <AccessBtnAuth authority={AdminAccess.ORDER_LIST_AUDIT}>
              <Button
                type="link"
                size="small"
                style={{ padding: '0 4px' }}
                onClick={() => handleAffirm(record)}
              >
                去确认
              </Button>
            </AccessBtnAuth>
          )}
        </Space>
      ),
    },
  ];

  /**
   * 获取订单列表数据
   */
  const fetchOrderList = async (params: any) => {
    const requestParams: OrderPageParams = {
      page: params.current,
      size: params.pageSize,
      status: params.status,
      orderId: params.orderId,
    };

    try {
      const response: any = await getOrderPage(requestParams);
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

  /**
   * 查看订单详情
   */
  const handleViewDetail = async (record: OrderVO) => {
    try {
      const response: any = await getOrderById(record.orderId);
      if (response.code === '200') {
        setDetailOrder(response.data);
        setDetailModalVisible(true);
      }
    } catch (error) {
      modal.error({
        title: '获取订单详情失败',
        content: error instanceof Error ? error.message : '未知错误',
      });
    }
  };

  /**
   * 付款 - 完善流程：订单付款 -> 创建收入记录(待审核) -> 更新订单状态为待确认
   */
  const handlePay = (record: OrderVO) => {
    // 重置表单数据
    payForm.resetFields();

    modal.confirm({
      title: '订单付款',
      icon: <PayCircleOutlined />,
      width: 600,
      content: (
        <Form form={payForm} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item label="订单号">
            <strong>{record.orderId}</strong>
          </Form.Item>
          <Form.Item label="订单金额">
            <strong style={{ color: '#ff4d4f', fontSize: '18px' }}>
              ¥{record.totalAmount?.toFixed(2) || '0.00'}
            </strong>
          </Form.Item>
          <Form.Item
            name="paymentMethod"
            label="支付方式"
            rules={[{ required: true, message: '请选择支付方式' }]}
            initialValue={PaymentMethodEnum.BANK}
          >
            <Radio.Group>
              <Radio value={PaymentMethodEnum.BANK}>银行转账</Radio>
              <Radio value={PaymentMethodEnum.ALIPAY}>支付宝</Radio>
              <Radio value={PaymentMethodEnum.WECHAT}>微信支付</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="evidence"
            label="付款凭证"
            rules={[{ required: true, message: '请上传付款凭证' }]}
          >
            <ImgUpload
              maxCount={1}
              accept="image/*,.pdf"
              listType="picture-card"
            />
          </Form.Item>
          <Form.Item
            name="note"
            label="备注"
          >
            <Input.TextArea rows={3} placeholder="请输入备注信息（可选）" />
          </Form.Item>
        </Form>
      ),
      onOk: async () => {
        try {
          const values = await payForm.validateFields();

          // 构建付款数据
          const paymentData = {
            orderId: record.orderId,
            orderAmount: record.totalAmount,
            paymentMethod: values.paymentMethod,
            evidence: values.evidence || '',
            note: values.note || '',
          };

          const response = await payOrder(paymentData);

          if (response.code === '200') {
            message.success('付款申请已提交，等待财务审核');
            actionRef.current?.reload();
          }
        } catch (error: any) {
          if (error.errorFields) {
            // 表单验证错误，不关闭弹窗
            return Promise.reject(error);
          }
          message.error('付款失败');
        }
      },
    });
  };

  /**
   * 取消订单
   */
  const handleCancel = (record: OrderVO) => {
    modal.confirm({
      title: '取消订单',
      content: `确定要取消订单 "${record.orderId}" 吗？`,
      onOk: async () => {
        try {
          const response = await cancelOrder(record.orderId);
          if (response.code === '200') {
            modal.success({
              content: '订单取消成功',
            });
            actionRef.current?.reload();
          }
        } catch (error) {
          modal.error({
            title: '订单取消失败',
            content: error instanceof Error ? error.message : '未知错误',
          });
        }
      },
    });
  };

  /**
   * 确认订单（去确认）
   */
  const handleAffirm = (record: OrderVO) => {
    modal.confirm({
      title: '确认订单',
      content: `确定要确认订单 "${record.orderId}" 吗？确认后订单将进入处理中状态。`,
      onOk: async () => {
        try {
          const response = await affirmOrder(record.orderId);
          if (response.code === '200') {
            modal.success({
              content: '订单确认成功',
            });
            actionRef.current?.reload();
          }
        } catch (error) {
          modal.error({
            title: '操作失败',
            content: error instanceof Error ? error.message : '未知错误',
          });
        }
      },
    });
  };



  /**
   * 关闭详情模态框
   */
  const handleCloseDetail = () => {
    setDetailModalVisible(false);
    setDetailOrder(null);
  };

  return (
    <PageContainer>
      <ProTable<OrderVO>
        columns={columns}
        actionRef={actionRef}
        request={fetchOrderList}
        rowKey="orderId"
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
      />

      <Modal
        title="订单详情"
        open={detailModalVisible}
        onCancel={handleCloseDetail}
        footer={null}
        width={800}
      >
        {detailOrder && (
          <>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="订单号">{detailOrder.orderId}</Descriptions.Item>
              <Descriptions.Item label="订单状态">
                {getOrderStatusTag(detailOrder.status)}
              </Descriptions.Item>
              <Descriptions.Item label="订单金额">
                <span style={{ fontWeight: 600, color: '#ff4d4f' }}>
                  ¥{detailOrder.totalAmount?.toFixed(2) || '0.00'}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="支付方式">
                {getPaymentMethodText(detailOrder.paymentMethod)}
              </Descriptions.Item>
              <Descriptions.Item label="收货地址" span={2}>
                {detailOrder.address}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">{detailOrder.createdTime}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{detailOrder.updatedTime}</Descriptions.Item>
            </Descriptions>

            {detailOrder.orderItems && detailOrder.orderItems.length > 0 && (
              <>
                <h4 style={{ marginTop: 24, marginBottom: 16 }}>商品明细</h4>
                {detailOrder.orderItems.map((item) => (
                  <Descriptions key={item.itemId} column={2} bordered size="small">
                    <Descriptions.Item label="商品名称">{item.productName}</Descriptions.Item>
                    <Descriptions.Item label="商品ID">{item.goodsId}</Descriptions.Item>
                    <Descriptions.Item label="数量">{item.quantity}</Descriptions.Item>
                    <Descriptions.Item label="单价">
                      ¥{item.fixedPrice?.toFixed(2) || '0.00'}
                    </Descriptions.Item>
                    <Descriptions.Item label="小计" span={2}>
                      <span style={{ fontWeight: 600, color: '#ff4d4f' }}>
                        ¥{item.subtotal?.toFixed(2) || '0.00'}
                      </span>
                    </Descriptions.Item>
                  </Descriptions>
                ))}
              </>
            )}
          </>
        )}
      </Modal>
    </PageContainer>
  );
};

export default OrderList;

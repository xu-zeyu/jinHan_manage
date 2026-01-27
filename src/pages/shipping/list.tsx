import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, Modal, Tag, Space, App, Descriptions, Form, message } from 'antd';
import { EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import React, { useRef, useState } from 'react';
import { useIntl } from '@umijs/max';
import { getShippingPage, getShippingById, updateShippingStatus, updateShipping } from '@/services/shipping';
import type { ShippingRecordVO, ShippingPageParams, ShippingStatusUpdateParams, ShippingUpdateParams } from '@/services/shipping/types';
import { ShippingStatusEnum } from '@/services/shipping/types';
import AccessBtnAuth from '@/components/AccessBtnAuth';
import { AdminAccess } from '@/common/data';
import ShippingFormModal from './components/ShippingFormModal';

const ShippingList: React.FC = () => {
  const intl = useIntl();
  const { modal } = App.useApp();
  const actionRef = useRef<ActionType>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailRecord, setDetailRecord] = useState<ShippingRecordVO | null>(null);
  const [shipModalVisible, setShipModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<ShippingRecordVO | null>(null);
  const [form] = Form.useForm();

  /**
   * 获取发货状态标签
   */
  const getShippingStatusTag = (status: ShippingStatusEnum) => {
    const statusMap = {
      [ShippingStatusEnum.PENDING_SHIP]: { text: '待发货', color: 'orange' },
      [ShippingStatusEnum.SHIPPED]: { text: '已发货', color: 'blue' },
      [ShippingStatusEnum.IN_TRANSIT]: { text: '运输中', color: 'cyan' },
      [ShippingStatusEnum.DELIVERED]: { text: '已送达', color: 'green' },
      [ShippingStatusEnum.FAILED]: { text: '发货失败', color: 'red' },
    };
    const config = statusMap[status] || { text: '未知', color: 'default' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  /**
   * 表格列配置
   */
  const columns: ProColumns<ShippingRecordVO>[] = [
    {
      title: '发货信息',
      dataIndex: 'shippingInfo',
      key: 'shippingInfo',
      width: 280,
      search: false,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>订单: {record.orderId}</div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {record.logisticsCompany && record.logisticsNo ? (
              <div>
                <div>物流: {record.logisticsCompany}</div>
                <div>单号: {record.logisticsNo}</div>
              </div>
            ) : (
              <div style={{ color: '#999' }}>暂无物流信息</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: '发货地址',
      dataIndex: 'shippingAddress',
      key: 'shippingAddress',
      width: 180,
      ellipsis: true,
      search: false,
    },
    {
      title: '状态与时间',
      dataIndex: 'statusTime',
      key: 'statusTime',
      width: 130,
      valueType: 'select',
      valueEnum: {
        [ShippingStatusEnum.PENDING_SHIP]: { text: '待发货', status: 'Warning' },
        [ShippingStatusEnum.SHIPPED]: { text: '已发货', status: 'Processing' },
        [ShippingStatusEnum.IN_TRANSIT]: { text: '运输中', status: 'Processing' },
        [ShippingStatusEnum.DELIVERED]: { text: '已送达', status: 'Success' },
        [ShippingStatusEnum.FAILED]: { text: '失败', status: 'Error' },
      },
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 4 }}>{getShippingStatusTag(record.status)}</div>
          {record.shipTime && (
            <div style={{ fontSize: 12, color: '#666' }}>{record.shipTime}</div>
          )}
        </div>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdTime',
      key: 'createdTime',
      width: 95,
      valueType: 'dateTime',
      sorter: true,
      search: false,
      render: (text) => (
        <div style={{ fontSize: 12 }}>{text}</div>
      ),
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      width: 135,
      align: 'center',
      fixed: 'right',
      search: false,
      render: (_, record) => (
        <Space size={0}>
          <AccessBtnAuth authority={AdminAccess.SHIPPING_LIST_VIEW}>
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
          {record.status === ShippingStatusEnum.PENDING_SHIP && (
            <AccessBtnAuth authority={AdminAccess.SHIPPING_LIST_STATUS_UPDATE}>
              <Button
                type="link"
                size="small"
                icon={<CheckCircleOutlined />}
                style={{ padding: '0 4px' }}
                onClick={() => handleShip(record)}
              >
                发货
              </Button>
            </AccessBtnAuth>
          )}
          {record.status === ShippingStatusEnum.SHIPPED && (
            <AccessBtnAuth authority={AdminAccess.SHIPPING_LIST_STATUS_UPDATE}>
              <Button
                type="link"
                size="small"
                icon={<CheckCircleOutlined />}
                style={{ padding: '0 4px' }}
                onClick={() => handleUpdateStatus(record, ShippingStatusEnum.IN_TRANSIT)}
              >
                运输
              </Button>
            </AccessBtnAuth>
          )}
          {record.status === ShippingStatusEnum.IN_TRANSIT && (
            <AccessBtnAuth authority={AdminAccess.SHIPPING_LIST_STATUS_UPDATE}>
              <Button
                type="link"
                size="small"
                icon={<CheckCircleOutlined />}
                style={{ padding: '0 4px' }}
                onClick={() => handleUpdateStatus(record, ShippingStatusEnum.DELIVERED)}
              >
                送达
              </Button>
            </AccessBtnAuth>
          )}
        </Space>
      ),
    },
  ];

  /**
   * 获取发货记录列表数据
   */
  const fetchShippingList = async (params: any) => {
    const requestParams: ShippingPageParams = {
      page: params.current,
      size: params.pageSize,
      orderId: params.shippingInfo,
      logisticsNo: params.shippingInfo,
      status: params.statusTime,
    };

    try {
      const response: any = await getShippingPage(requestParams);
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
   * 查看发货记录详情
   */
  const handleViewDetail = async (record: ShippingRecordVO) => {
    try {
      const response: any = await getShippingById(record.id);
      if (response.code === '200') {
        setDetailRecord(response.data);
        setDetailModalVisible(true);
      }
    } catch (error) {
      modal.error({
        title: '获取发货详情失败',
        content: error instanceof Error ? error.message : '未知错误',
      });
    }
  };

  /**
   * 处理发货（打开表单弹窗）
   */
  const handleShip = (record: ShippingRecordVO) => {
    setCurrentRecord(record);
    form.setFieldsValue({
      logisticsCompany: record.logisticsCompany || '',
      logisticsNo: record.logisticsNo || '',
      shippingAddress: record.shippingAddress || '',
      remark: record.remark || '',
    });
    setShipModalVisible(true);
  };

  /**
   * 提交发货表单
   */
  const handleShipSubmit = async (values: any) => {
    if (!currentRecord) return;

    try {
      // 更新发货记录信息
      const updateParams: ShippingUpdateParams = {
        id: currentRecord.id,
        logisticsCompany: values.logisticsCompany,
        logisticsNo: values.logisticsNo,
        shippingAddress: values.shippingAddress,
        remark: values.remark,
      };

      const updateResponse = await updateShipping(updateParams);
      if (updateResponse.code === '200') {
        // 更新发货状态为已发货
        const statusParams: ShippingStatusUpdateParams = {
          id: currentRecord.id,
          status: ShippingStatusEnum.SHIPPED,
        };
        const statusResponse = await updateShippingStatus(statusParams);

        if (statusResponse.code === '200') {
          message.success('发货成功');
          setShipModalVisible(false);
          form.resetFields();
          setCurrentRecord(null);
          actionRef.current?.reload();
        }
      }
    } catch (error) {
      modal.error({
        title: '发货失败',
        content: error instanceof Error ? error.message : '未知错误',
      });
    }
  };

  /**
   * 关闭发货弹窗
   */
  const handleShipCancel = () => {
    setShipModalVisible(false);
    form.resetFields();
    setCurrentRecord(null);
  };

  /**
   * 更新发货状态（运输中、已送达等）
   */
  const handleUpdateStatus = (record: ShippingRecordVO, status: ShippingStatusEnum) => {
    const statusText: any = {
      SHIPPED: '已发货',
      IN_TRANSIT: '运输中',
      DELIVERED: '已送达',
    };

    modal.confirm({
      title: '更新发货状态',
      content: `确定要将订单 "${record.orderId}" 标记为"${statusText[status]}"吗？`,
      onOk: async () => {
        try {
          const params: ShippingStatusUpdateParams = {
            id: record.id,
            status,
          };
          const response = await updateShippingStatus(params);
          if (response.code === '200') {
            message.success('状态更新成功');
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
    setDetailRecord(null);
  };

  /**
   * 获取发货弹窗标题
   */
  const getShipModalTitle = () => {
    if (!currentRecord) return '填写发货信息';
    return `填写发货信息 - 订单号: ${currentRecord.orderId}`;
  };

  return (
    <PageContainer>
      <ProTable<ShippingRecordVO>
        columns={columns}
        actionRef={actionRef}
        request={fetchShippingList}
        rowKey="id"
        search={{
          labelWidth: 80,
          span: 8,
        }}
        options={{
          density: true,
          fullScreen: true,
          reload: true,
          setting: true,
        }}
        pagination={{
          defaultPageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
          position: ['bottomCenter'],
          pageSizeOptions: [10, 20, 50, 100],
          showTotal: (total, range) => `共 ${total} 条`,
        }}
      />

      {/* 发货表单弹窗 */}
      <ShippingFormModal
        visible={shipModalVisible}
        onCancel={handleShipCancel}
        onSubmit={handleShipSubmit}
        form={form}
        initialValues={{
          logisticsCompany: currentRecord?.logisticsCompany || '',
          logisticsNo: currentRecord?.logisticsNo || '',
          shippingAddress: currentRecord?.shippingAddress || '',
          remark: currentRecord?.remark || '',
        }}
        isEdit={true}
      />

      {/* 详情模态框 */}
      <Modal
        title="发货详情"
        open={detailModalVisible}
        onCancel={handleCloseDetail}
        footer={null}
        width={800}
      >
        {detailRecord && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="ID">{detailRecord.id}</Descriptions.Item>
            <Descriptions.Item label="订单号">{detailRecord.orderId}</Descriptions.Item>
            <Descriptions.Item label="发货状态">
              {getShippingStatusTag(detailRecord.status)}
            </Descriptions.Item>
            <Descriptions.Item label="物流公司">{detailRecord.logisticsCompany}</Descriptions.Item>
            <Descriptions.Item label="物流单号">{detailRecord.logisticsNo}</Descriptions.Item>
            <Descriptions.Item label="发货地址" span={2}>
              {detailRecord.shippingAddress}
            </Descriptions.Item>
            {detailRecord.remark && (
              <Descriptions.Item label="备注" span={2}>
                {detailRecord.remark}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="创建时间">{detailRecord.createdTime}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{detailRecord.updatedTime}</Descriptions.Item>
            {detailRecord.shipTime && (
              <Descriptions.Item label="发货时间">{detailRecord.shipTime}</Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </PageContainer>
  );
};

export default ShippingList;

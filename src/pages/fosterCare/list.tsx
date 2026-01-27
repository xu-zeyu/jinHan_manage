import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, Modal, Tag, Space, App, Descriptions, Form, message } from 'antd';
import { EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import React, { useRef, useState } from 'react';
import { useIntl } from '@umijs/max';
import {
  getFosterCarePage,
  getFosterCareById,
  updateFosterCareStatus
} from '@/services/fosterCare';
import type {
  FosterCareRecordVO,
  FosterCarePageParams,
  FosterCareStatusUpdateParams
} from '@/services/fosterCare/types';
import { FosterCareStatusEnum, PetTypeEnum } from '@/services/fosterCare/types';
import AccessBtnAuth from '@/components/AccessBtnAuth';
import { AdminAccess } from '@/common/data';
import FosterCareFormModal from './components/FosterCareFormModal';

const FosterCareList: React.FC = () => {
  const intl = useIntl();
  const { modal } = App.useApp();
  const actionRef = useRef<ActionType>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailRecord, setDetailRecord] = useState<FosterCareRecordVO | null>(null);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<FosterCareRecordVO | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [form] = Form.useForm();

  /**
   * 获取寄养状态标签
   */
  const getStatusTag = (status: FosterCareStatusEnum) => {
    const statusMap = {
      [FosterCareStatusEnum.PENDING]: { text: '待寄养', color: 'orange' },
      [FosterCareStatusEnum.FOSTERING]: { text: '寄养中', color: 'blue' },
      [FosterCareStatusEnum.COMPLETED]: { text: '已完成', color: 'green' },
      [FosterCareStatusEnum.CANCELLED]: { text: '已取消', color: 'red' },
    };
    const config = statusMap[status] || { text: '未知', color: 'default' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  /**
   * 获取宠物类型文本
   */
  const getPetTypeText = (petType: PetTypeEnum) => {
    const typeMap = {
      [PetTypeEnum.CAT]: '猫',
      [PetTypeEnum.DOG]: '狗',
      [PetTypeEnum.BIRD]: '鸟类',
      [PetTypeEnum.RABBIT]: '兔子',
      [PetTypeEnum.OTHER]: '其他',
    };
    return typeMap[petType] || '未知';
  };

  /**
   * 表格列配置
   */
  const columns: ProColumns<FosterCareRecordVO>[] = [
    {
      title: '寄养对象',
      dataIndex: 'fosterTarget',
      key: 'fosterTarget',
      width: 180,
      search: false,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>
            {getPetTypeText(record.petType)} · {record.petName}
          </div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>
            宠物ID: {record.petId}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            主人: {record.ownerName} · {record.ownerPhone}
          </div>
        </div>
      ),
    },
    {
      title: '宠物名称',
      dataIndex: 'petName',
      key: 'petName',
      hideInTable: true,
      search: true,
    },
    {
      title: '宠物类型',
      dataIndex: 'petType',
      key: 'petType',
      hideInTable: true,
      valueType: 'select',
      valueEnum: {
        [PetTypeEnum.CAT]: { text: '猫' },
        [PetTypeEnum.DOG]: { text: '狗' },
        [PetTypeEnum.BIRD]: { text: '鸟类' },
        [PetTypeEnum.RABBIT]: { text: '兔子' },
        [PetTypeEnum.OTHER]: { text: '其他' },
      },
    },
    {
      title: '主人姓名',
      dataIndex: 'ownerName',
      key: 'ownerName',
      hideInTable: true,
      search: true,
    },
    {
      title: '联系电话',
      dataIndex: 'ownerPhone',
      key: 'ownerPhone',
      hideInTable: true,
      search: true,
    },
    {
      title: '寄养详情',
      dataIndex: 'fosterDetail',
      key: 'fosterDetail',
      width: 160,
      search: false,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            {record.fosterStartDate} 至
          </div>
          <div>{record.fosterEndDate}</div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            {record.fosterDays}天 · ¥{record.fosterPrice}/天 · 共¥{record.totalAmount}
          </div>
        </div>
      ),
    },
    {
      title: '寄养地址',
      dataIndex: 'fosterAddress',
      key: 'fosterAddress',
      width: 180,
      ellipsis: true,
      search: false,
    },
    {
      title: '状态信息',
      dataIndex: 'statusInfo',
      key: 'statusInfo',
      width: 120,
      search: false,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 4 }}>{getStatusTag(record.status)}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.createdTime}</div>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      hideInTable: true,
      valueType: 'select',
      valueEnum: {
        [FosterCareStatusEnum.PENDING]: { text: '待寄养', status: 'Warning' },
        [FosterCareStatusEnum.FOSTERING]: { text: '寄养中', status: 'Processing' },
        [FosterCareStatusEnum.COMPLETED]: { text: '已完成', status: 'Success' },
        [FosterCareStatusEnum.CANCELLED]: { text: '已取消', status: 'Error' },
      },
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      width: 200,
      align: 'center',
      fixed: 'right',
      search: false,
      render: (_, record) => (
        <Space size={0}>
          <AccessBtnAuth authority={AdminAccess.FOSTER_CARE_LIST_VIEW}>
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
          {record.status === FosterCareStatusEnum.PENDING && (
            <>
              <AccessBtnAuth authority={AdminAccess.FOSTER_CARE_LIST_UPDATE}>
                <Button
                  type="link"
                  size="small"
                  style={{ padding: '0 4px' }}
                  onClick={() => handleEdit(record)}
                >
                  编辑
                </Button>
              </AccessBtnAuth>
              <AccessBtnAuth authority={AdminAccess.FOSTER_CARE_LIST_STATUS_UPDATE}>
                <Button
                  type="link"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  style={{ padding: '0 4px' }}
                  onClick={() => handleStartFoster(record)}
                >
                  开始
                </Button>
              </AccessBtnAuth>
            </>
          )}
          {record.status === FosterCareStatusEnum.FOSTERING && (
            <AccessBtnAuth authority={AdminAccess.FOSTER_CARE_LIST_STATUS_UPDATE}>
              <Button
                type="link"
                size="small"
                icon={<CheckCircleOutlined />}
                style={{ padding: '0 4px' }}
                onClick={() => handleComplete(record)}
              >
                完成
              </Button>
            </AccessBtnAuth>
          )}
          {record.status === FosterCareStatusEnum.PENDING && (
            <AccessBtnAuth authority={AdminAccess.FOSTER_CARE_LIST_STATUS_UPDATE}>
              <Button
                type="link"
                size="small"
                icon={<CloseCircleOutlined />}
                style={{ padding: '0 4px' }}
                onClick={() => handleCancel(record)}
              >
                取消
              </Button>
            </AccessBtnAuth>
          )}
        </Space>
      ),
    },
  ];

  /**
   * 获取寄养记录列表数据
   */
  const fetchFosterCareList = async (params: any) => {
    const requestParams: FosterCarePageParams = {
      page: params.current,
      size: params.pageSize,
      petName: params.petName,
      petType: params.petType,
      ownerName: params.ownerName,
      ownerPhone: params.ownerPhone,
      status: params.status,
      fosterStartDateStart: params.fosterStartDateStart,
      fosterStartDateEnd: params.fosterStartDateEnd,
    };

    try {
      const response: any = await getFosterCarePage(requestParams);
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
   * 查看寄养记录详情
   */
  const handleViewDetail = async (record: FosterCareRecordVO) => {
    try {
      const response: any = await getFosterCareById(record.id);
      if (response.code === '200') {
        setDetailRecord(response.data);
        setDetailModalVisible(true);
      }
    } catch (error) {
      modal.error({
        title: '获取寄养详情失败',
        content: error instanceof Error ? error.message : '未知错误',
      });
    }
  };

  /**
   * 新增寄养记录
   */
  const handleCreate = () => {
    setCurrentRecord(null);
    setIsEdit(false);
    form.resetFields();
    setFormModalVisible(true);
  };

  /**
   * 编辑寄养记录
   */
  const handleEdit = (record: FosterCareRecordVO) => {
    setCurrentRecord(record);
    setIsEdit(true);
    form.setFieldsValue({
      petId: record.petId,
      petName: record.petName,
      petType: record.petType,
      ownerName: record.ownerName,
      ownerPhone: record.ownerPhone,
      fosterStartDate: record.fosterStartDate ? new Date(record.fosterStartDate) : null,
      fosterEndDate: record.fosterEndDate ? new Date(record.fosterEndDate) : null,
      fosterPrice: record.fosterPrice ? parseFloat(record.fosterPrice) : undefined,
      fosterAddress: record.fosterAddress,
      specialRequirements: record.specialRequirements,
      remark: record.remark,
    });
    setFormModalVisible(true);
  };

  /**
   * 开始寄养
   */
  const handleStartFoster = (record: FosterCareRecordVO) => {
    modal.confirm({
      title: '确认开始寄养',
      content: `确定要开始寄养 "${record.petName}" 吗？`,
      onOk: async () => {
        try {
          const params: FosterCareStatusUpdateParams = {
            id: record.id,
            status: FosterCareStatusEnum.FOSTERING,
          };
          const response = await updateFosterCareStatus(params);
          if (response.code === '200') {
            message.success('寄养已开始');
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
   * 完成寄养
   */
  const handleComplete = (record: FosterCareRecordVO) => {
    modal.confirm({
      title: '确认完成寄养',
      content: `确定要完成寄养 "${record.petName}" 吗？`,
      onOk: async () => {
        try {
          const params: FosterCareStatusUpdateParams = {
            id: record.id,
            status: FosterCareStatusEnum.COMPLETED,
          };
          const response = await updateFosterCareStatus(params);
          if (response.code === '200') {
            message.success('寄养已完成');
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
   * 取消寄养
   */
  const handleCancel = (record: FosterCareRecordVO) => {
    modal.confirm({
      title: '确认取消寄养',
      content: `确定要取消寄养 "${record.petName}" 吗？`,
      onOk: async () => {
        try {
          const params: FosterCareStatusUpdateParams = {
            id: record.id,
            status: FosterCareStatusEnum.CANCELLED,
          };
          const response = await updateFosterCareStatus(params);
          if (response.code === '200') {
            message.success('寄养已取消');
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
   * 关闭表单弹窗
   */
  const handleCloseForm = () => {
    setFormModalVisible(false);
    form.resetFields();
    setCurrentRecord(null);
  };

  /**
   * 表单提交成功
   */
  const handleFormSubmitSuccess = () => {
    setFormModalVisible(false);
    form.resetFields();
    setCurrentRecord(null);
    actionRef.current?.reload();
  };

  return (
    <PageContainer
      extra={
        <AccessBtnAuth authority={AdminAccess.FOSTER_CARE_LIST_CREATE}>
          <Button type="primary" onClick={handleCreate}>
            新增寄养
          </Button>
        </AccessBtnAuth>
      }
    >
      <ProTable<FosterCareRecordVO>
        columns={columns}
        actionRef={actionRef}
        request={fetchFosterCareList}
        rowKey="id"
        search={{
          labelWidth: 80,
          span: 6,
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

      {/* 表单弹窗 */}
      <FosterCareFormModal
        visible={formModalVisible}
        onCancel={handleCloseForm}
        onSubmitSuccess={handleFormSubmitSuccess}
        form={form}
        initialValues={{
          petId: currentRecord?.petId,
          petName: currentRecord?.petName,
          petType: currentRecord?.petType,
          ownerName: currentRecord?.ownerName,
          ownerPhone: currentRecord?.ownerPhone,
          fosterStartDate: currentRecord?.fosterStartDate,
          fosterEndDate: currentRecord?.fosterEndDate,
          fosterPrice: currentRecord?.fosterPrice ? parseFloat(currentRecord.fosterPrice) : undefined,
          fosterAddress: currentRecord?.fosterAddress,
          specialRequirements: currentRecord?.specialRequirements,
          remark: currentRecord?.remark,
        }}
        isEdit={isEdit}
        recordId={currentRecord?.id}
      />

      {/* 详情模态框 */}
      <Modal
        title="寄养详情"
        open={detailModalVisible}
        onCancel={handleCloseDetail}
        footer={null}
        width={800}
      >
        {detailRecord && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="ID">{detailRecord.id}</Descriptions.Item>
            <Descriptions.Item label="宠物ID">{detailRecord.petId}</Descriptions.Item>
            <Descriptions.Item label="宠物名称">{detailRecord.petName}</Descriptions.Item>
            <Descriptions.Item label="宠物类型">
              {getPetTypeText(detailRecord.petType)}
            </Descriptions.Item>
            <Descriptions.Item label="主人姓名">{detailRecord.ownerName}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{detailRecord.ownerPhone}</Descriptions.Item>
            <Descriptions.Item label="寄养状态">
              {getStatusTag(detailRecord.status)}
            </Descriptions.Item>
            <Descriptions.Item label="寄养天数">{detailRecord.fosterDays} 天</Descriptions.Item>
            <Descriptions.Item label="寄养单价">¥{detailRecord.fosterPrice}</Descriptions.Item>
            <Descriptions.Item label="总金额">¥{detailRecord.totalAmount}</Descriptions.Item>
            <Descriptions.Item label="开始日期" span={2}>
              {detailRecord.fosterStartDate}
            </Descriptions.Item>
            <Descriptions.Item label="结束日期" span={2}>
              {detailRecord.fosterEndDate}
            </Descriptions.Item>
            <Descriptions.Item label="寄养地址" span={2}>
              {detailRecord.fosterAddress}
            </Descriptions.Item>
            {detailRecord.specialRequirements && (
              <Descriptions.Item label="特殊要求" span={2}>
                {detailRecord.specialRequirements}
              </Descriptions.Item>
            )}
            {detailRecord.remark && (
              <Descriptions.Item label="备注" span={2}>
                {detailRecord.remark}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="创建时间">{detailRecord.createdTime}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{detailRecord.updatedTime}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </PageContainer>
  );
};

export default FosterCareList;

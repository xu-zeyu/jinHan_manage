import React, { useState, useRef } from 'react';
import { useIntl } from '@umijs/max';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Popconfirm, Space, Switch, Select, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import type { VarietyVO, VarietyPageParams } from '@/services/variety/types';
import { getVarietyPage, deleteVariety, updateVariety } from '@/services/variety';
import VarietyForm from './components/VarietyForm';
import type { VarietyFormRef } from './components/VarietyForm';
import VarietyQuickAddModal from './components/VarietyQuickAddModal';
import AccessBtnAuth from '@/components/AccessBtnAuth';
import { AdminAccess } from '@/common/data';

const VarietyList: React.FC = () => {
  const intl = useIntl();
  const { message } = App.useApp();
  const actionRef = useRef<ActionType>(null);
  const formRef = useRef<VarietyFormRef>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [editingRecord, setEditingRecord] = useState<VarietyVO | null>(null);
  const [quickAddModalVisible, setQuickAddModalVisible] = useState(false);

  /**
   * 处理添加
   */
  const handleAdd = () => {
    setEditingRecord(null);
    setModalTitle(intl.formatMessage({ id: 'variety.modal.createTitle' }));
    setModalVisible(true);
  };

  /**
   * 处理编辑
   */
  const handleEdit = (record: VarietyVO) => {
    setEditingRecord(record);
    setModalTitle(intl.formatMessage({ id: 'variety.modal.updateTitle' }));
    setModalVisible(true);
  };

  /**
   * 处理删除
   */
  const handleDelete = async (id: number) => {
    try {
      const response = await deleteVariety(id);
      if (response.code === '200') {
        message.success(intl.formatMessage({ id: 'variety.message.deleteSuccess' }));
        actionRef.current?.reload();
      } else {
        message.error(response.message || intl.formatMessage({ id: 'variety.message.deleteFailed' }));
      }
    } catch (error) {
      message.error(intl.formatMessage({ id: 'variety.message.deleteFailed' }));
    }
  };

  /**
   * 处理状态切换
   */
  const handleStatusChange = async (checked: boolean, record: VarietyVO) => {
    try {
      const status = checked ? 1 : 0;
      const response = await updateVariety({
        ...record,
        status,
      });
      if (response.code === '200') {
        message.success(intl.formatMessage({ id: 'variety.message.statusUpdateSuccess' }));
        actionRef.current?.reload();
      } else {
        message.error(response.message || intl.formatMessage({ id: 'variety.message.statusUpdateFailed' }));
      }
    } catch (error) {
      message.error(intl.formatMessage({ id: 'variety.message.statusUpdateFailed' }));
    }
  };

  /**
   * 处理模态框确定
   */
  const handleModalOk = async () => {
    try {
      const values = await formRef.current?.getValues();
      if (values) {
        actionRef.current?.reload();
        setModalVisible(false);
      }
    } catch (error) {
      // 表单验证失败
    }
  };

  /**
   * 处理模态框取消
   */
  const handleModalCancel = () => {
    setModalVisible(false);
  };

  /**
   * 处理快速添加
   */
  const handleQuickAdd = () => {
    setQuickAddModalVisible(true);
  };

  /**
   * 处理快速添加成功
   */
  const handleQuickAddSuccess = () => {
    actionRef.current?.reload();
  };

  /**
   * 处理关闭快速添加模态框
   */
  const handleQuickAddClose = () => {
    setQuickAddModalVisible(false);
  };

  /**
   * 查询数据
   */
  const fetchData = async (params: VarietyPageParams & { pageSize?: number; current?: number }) => {
    const response = await getVarietyPage({
      page: params.current || 1,
      size: params.pageSize || 10,
      name: params.name,
      status: params.status,
    });

    if (response.code === '200') {
      return {
        data: response.data.records || [],
        success: true,
        total: response.data.total || 0,
      };
    }
    return {
      data: [],
      success: false,
      total: 0,
    };
  };

  /**
   * 表格列配置
   */
  const columns: ProColumns<VarietyVO>[] = [
    {
      title: intl.formatMessage({ id: 'variety.table.id' }),
      dataIndex: 'id',
      hideInSearch: true,
      width: 80,
    },
    {
      title: intl.formatMessage({ id: 'variety.table.name' }),
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: intl.formatMessage({ id: 'variety.table.icon' }),
      dataIndex: 'iconUrl',
      hideInSearch: true,
      render: (_, record) => {
        return record.iconUrl ? (
          <img src={record.iconUrl} alt={record.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '50%' }} />
        ) : (
          <div style={{ width: 40, height: 40, background: '#f0f0f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            -
          </div>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'variety.table.minPrice' }),
      dataIndex: 'minPrice',
      hideInSearch: true,
      valueType: 'money',
      width: 120,
    },
    {
      title: intl.formatMessage({ id: 'variety.table.sortOrder' }),
      dataIndex: 'sortOrder',
      hideInSearch: true,
      width: 100,
    },
    {
      title: intl.formatMessage({ id: 'variety.table.status' }),
      dataIndex: 'status',
      render: (_, record) => {
        const checked = record.status === 1;
        return (
          <AccessBtnAuth authority={AdminAccess.VARIETY_LIST_UPDATE}>
            <Switch
              checked={checked}
              checkedChildren={intl.formatMessage({ id: 'variety.status.on' })}
              unCheckedChildren={intl.formatMessage({ id: 'variety.status.off' })}
              onChange={(checked) => handleStatusChange(checked, record)}
            />
          </AccessBtnAuth>
        );
      },
      renderFormItem: () => {
        return (
          <Select
            placeholder={intl.formatMessage({ id: 'variety.table.statusPlaceholder' })}
            style={{ minWidth: 120 }}
            allowClear
          >
            <Select.Option value="1">{intl.formatMessage({ id: 'variety.status.on' })}</Select.Option>
            <Select.Option value="0">{intl.formatMessage({ id: 'variety.status.off' })}</Select.Option>
          </Select>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'variety.table.createdTime' }),
      dataIndex: 'createdTime',
      hideInSearch: true,
      valueType: 'dateTime',
      width: 180,
    },
    {
      title: intl.formatMessage({ id: 'table.actions' }),
      valueType: 'option',
      width: 150,
      render: (_, record) => (
        <Space>
          <AccessBtnAuth authority={AdminAccess.VARIETY_LIST_UPDATE}>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              {intl.formatMessage({ id: 'table.edit' })}
            </Button>
          </AccessBtnAuth>
          <AccessBtnAuth authority={AdminAccess.VARIETY_LIST_DELETE}>
            <Popconfirm
              title={intl.formatMessage({ id: 'variety.message.deleteConfirm' })}
              onConfirm={() => handleDelete(record.id)}
            >
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
              >
                {intl.formatMessage({ id: 'table.delete' })}
              </Button>
            </Popconfirm>
          </AccessBtnAuth>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<VarietyVO, VarietyPageParams>
        headerTitle={intl.formatMessage({ id: 'variety.list.headerTitle' })}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <AccessBtnAuth authority={AdminAccess.VARIETY_LIST_CREATE} key="create">
            <Button
              type="primary"
              key="primary"
              onClick={handleAdd}
            >
              <PlusOutlined />
              {intl.formatMessage({ id: 'variety.button.create' })}
            </Button>
          </AccessBtnAuth>,
          <AccessBtnAuth authority={AdminAccess.VARIETY_LIST_CREATE} key="quickAdd">
            <Button
              key="quickAdd"
              icon={<PlusCircleOutlined />}
              onClick={handleQuickAdd}
            >
              {intl.formatMessage({ id: 'variety.button.quickAdd' })}
            </Button>
          </AccessBtnAuth>,
        ]}
        request={fetchData}
        columns={columns}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />

      <VarietyForm
        ref={formRef}
        visible={modalVisible}
        title={modalTitle}
        initialValues={editingRecord}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      />

      <VarietyQuickAddModal
        visible={quickAddModalVisible}
        onClose={handleQuickAddClose}
        onSuccess={handleQuickAddSuccess}
      />
    </PageContainer>
  );
};

export default VarietyList;

import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { App, Button, Form, Image, Input, Modal, Popconfirm, Select, Space, Tag } from 'antd';
import dayjs from 'dayjs';
import React, { useMemo, useRef, useState } from 'react';
import AccessBtnAuth from '@/components/AccessBtnAuth';
import ImgUpload from '@/components/ImgUpload';
import { AdminAccess } from '@/common/data';
import {
  bannerByOneApi,
  bannerListApi,
  createBannerApi,
  deleteBannerApi,
  updateBannerApi,
  type BannerFormValues,
  type BannerItem,
  type BannerPageParams,
  type BannerPlatform,
  type BannerStatus,
} from '@/services/banner';

const statusOptions: { label: string; value: BannerStatus; color: string }[] = [
  { label: '启用', value: 'ENABLE', color: 'success' },
  { label: '禁用', value: 'HIDDEN', color: 'default' },
];

const platformOptions: { label: string; value: BannerPlatform }[] = [
  { label: '全部', value: 'ALL' },
  { label: 'PC', value: 'PC' },
  { label: '移动端', value: 'MOBILE' },
];

const BannerList: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const { message, modal } = App.useApp();
  const [form] = Form.useForm<BannerFormValues>();
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingRecord, setEditingRecord] = useState<BannerItem | null>(null);

  const isEditing = !!editingRecord?.id;

  const statusMap = useMemo(
    () =>
      statusOptions.reduce<Record<string, { label: string; color: string }>>((acc, item) => {
        acc[item.value] = { label: item.label, color: item.color };
        return acc;
      }, {}),
    [],
  );

  const openCreateModal = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      status: 'ENABLE',
      platform: 'ALL',
      startTime: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
      endTime: dayjs().add(7, 'day').format('YYYY-MM-DDTHH:mm:ss'),
    });
    setModalVisible(true);
  };

  const openEditModal = async (record: BannerItem) => {
    try {
      const res = await bannerByOneApi(record.id);
      const data = res.data;
      setEditingRecord(data);
      form.setFieldsValue({
        id: data.id,
        url: data.url,
        link: data.link,
        title: data.title,
        description: data.description,
        status: data.status,
        platform: data.platform,
        startTime: data.startTime ? dayjs(data.startTime).format('YYYY-MM-DDTHH:mm:ss') : '',
        endTime: data.endTime ? dayjs(data.endTime).format('YYYY-MM-DDTHH:mm:ss') : '',
      });
      setModalVisible(true);
    } catch (error) {
      modal.error({
        title: '获取 Banner 详情失败',
      });
    }
  };

  const handleDelete = async (record: BannerItem) => {
    try {
      await deleteBannerApi(record.id);
      message.success('Banner 删除成功');
      actionRef.current?.reload();
    } catch {
      modal.error({
        title: '删除失败',
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      if (isEditing) {
        await updateBannerApi(values);
        message.success('Banner 更新成功');
      } else {
        await createBannerApi(values);
        message.success('Banner 新增成功');
      }
      setModalVisible(false);
      setEditingRecord(null);
      form.resetFields();
      actionRef.current?.reload();
    } catch (error) {
      if ((error as { errorFields?: unknown }).errorFields) {
        return;
      }
      modal.error({
        title: isEditing ? '更新失败' : '新增失败',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const columns: ProColumns<BannerItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 72,
      search: false,
    },
    {
      title: 'Banner',
      dataIndex: 'url',
      search: false,
      width: 220,
      render: (_, record) => (
        <Space size={12}>
          <Image
            src={record.url}
            alt={record.title}
            width={88}
            height={52}
            style={{ objectFit: 'cover', borderRadius: 10 }}
            fallback="data:image/gif;base64,R0lGODlhAQABAAAAACw="
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, color: '#1f1f1f' }}>{record.title}</div>
            <div style={{ color: '#8c8c8c', fontSize: 12, marginTop: 4 }}>
              {record.description || '暂无描述'}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      width: 180,
      ellipsis: true,
    },
    {
      title: '平台',
      dataIndex: 'platform',
      width: 100,
      valueType: 'select',
      valueEnum: {
        ALL: { text: '全部' },
        PC: { text: 'PC' },
        MOBILE: { text: '移动端' },
      },
      render: (_, record) => <Tag>{platformOptions.find((item) => item.value === record.platform)?.label || record.platform}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      valueType: 'select',
      valueEnum: {
        ENABLE: { text: '启用', status: 'Success' },
        HIDDEN: { text: '禁用', status: 'Default' },
      },
      render: (_, record) => {
        const current = statusMap[record.status];
        return <Tag color={current?.color}>{current?.label || record.status}</Tag>;
      },
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      width: 180,
      search: false,
      valueType: 'dateTime',
      render: (_, record) => dayjs(record.startTime).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      width: 180,
      search: false,
      valueType: 'dateTime',
      render: (_, record) => dayjs(record.endTime).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size={0}>
          <AccessBtnAuth authority={AdminAccess.BANNER_LIST_UPDATE}>
            <Button type="link" size="small" onClick={() => openEditModal(record)}>
              编辑
            </Button>
          </AccessBtnAuth>
          <AccessBtnAuth authority={AdminAccess.BANNER_LIST_DELETE}>
            <Popconfirm title="确认删除该 Banner 吗？" onConfirm={() => handleDelete(record)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          </AccessBtnAuth>
        </Space>
      ),
    },
  ];

  const fetchBanners = async (params: BannerPageParams & { current?: number; pageSize?: number }) => {
    const res = await bannerListApi({
      page: params.current,
      size: params.pageSize,
      title: params.title,
      status: params.status,
      platform: params.platform,
    });

    return {
      data: res.data?.records || [],
      success: res.code === '200',
      total: res.data?.total || 0,
    };
  };

  return (
    <PageContainer>
      <ProTable<BannerItem>
        columns={columns}
        actionRef={actionRef}
        request={fetchBanners}
        rowKey="id"
        cardBordered
        scroll={{ x: 1200 }}
        search={{
          labelWidth: 88,
        }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        toolBarRender={() => [
          <AccessBtnAuth authority={AdminAccess.BANNER_LIST_CREATE} key="create">
            <Button key="button" icon={<PlusOutlined />} onClick={openCreateModal} type="primary">
              新增 Banner
            </Button>
          </AccessBtnAuth>,
        ]}
      />

      <Modal
        title={isEditing ? '编辑 Banner' : '新增 Banner'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingRecord(null);
          form.resetFields();
        }}
        onOk={handleSubmit}
        confirmLoading={submitting}
        width={720}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder="请输入 Banner 标题" maxLength={32} />
          </Form.Item>
          <Form.Item name="url" label="Banner 图片" rules={[{ required: true, message: '请上传 Banner 图片' }]}>
            <ImgUpload maxCount={1} accept="image/*" />
          </Form.Item>
          <Form.Item name="link" label="跳转链接">
            <Input placeholder="请输入跳转链接，可为空" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="补充展示文案，可为空" maxLength={120} showCount />
          </Form.Item>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 16,
            }}
          >
            <Form.Item name="platform" label="展示平台" rules={[{ required: true, message: '请选择展示平台' }]}>
              <Select options={platformOptions} />
            </Form.Item>
            <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
              <Select options={statusOptions.map(({ label, value }) => ({ label, value }))} />
            </Form.Item>
            <Form.Item
              name="startTime"
              label="开始时间"
              rules={[{ required: true, message: '请输入开始时间' }]}
              extra="格式：2026-04-21T12:00:00"
            >
              <Input type="datetime-local" />
            </Form.Item>
            <Form.Item
              name="endTime"
              label="结束时间"
              rules={[{ required: true, message: '请输入结束时间' }]}
              extra="格式：2026-04-28T12:00:00"
            >
              <Input type="datetime-local" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default BannerList;

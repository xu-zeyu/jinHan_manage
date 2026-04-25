import type {ActionType, ProColumns} from '@ant-design/pro-components';
import {PageContainer, ProTable} from '@ant-design/pro-components';
import {Button, Modal, Tag, Space} from 'antd';
import {CheckCircleOutlined, EyeOutlined} from '@ant-design/icons';
import React, {useRef, useState} from 'react';
import {useIntl} from '@umijs/max';
import {
  getUserPage,
  getUserById,
} from '@/services/user';
import type {UserVO, UserPageParams} from '@/services/user/types';
import {UserStatusEnum, UserStatusTextMap, GenderEnum, GenderTextMap} from '@/services/user/types';
import UserForm from './components/UserForm';
import UserAuthAuditModal from '../components/UserAuthAuditModal';
import AccessBtnAuth from '@/components/AccessBtnAuth';
import {AdminAccess} from '@/common/data';

const UserList: React.FC = () => {
  const intl = useIntl();
  const actionRef = useRef<ActionType>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<UserVO | null>(null);
  const [auditModalVisible, setAuditModalVisible] = useState(false);
  const [selectedUserForAudit, setSelectedUserForAudit] = useState<UserVO | null>(null);

  /**
   * 表格列配置
   */
  const columns: ProColumns<UserVO>[] = [
    {
      title: '用户信息',
      key: 'userInfo',
      search: false,
      width: 250,
      render: (_, record) => (
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4}}>
            <div style={{fontWeight: 500, fontSize: '14px', color: '#262626', lineHeight: '1.4'}}>
              {record.username || '-'}
            </div>
            <div style={{fontSize: '12px', color: '#8c8c8c', lineHeight: '1.4'}}>
              手机号: {record.phone || '-'}
            </div>
            <div style={{fontSize: '12px', color: '#8c8c8c'}}>
              性别: {record.gender ? GenderTextMap[record.gender] : '-'}
            </div>
            <div style={{fontSize: '12px', color: '#bfbfbf'}}>
              ID: {record.userId}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      search: true,
      hideInTable: true,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 150,
      search: true,
      hideInTable: true,
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 100,
      valueType: 'select',
      search: true,
      hideInTable: true,
      valueEnum: {
        [GenderEnum.MALE]: {
          text: GenderTextMap[GenderEnum.MALE],
        },
        [GenderEnum.FEMALE]: {
          text: GenderTextMap[GenderEnum.FEMALE],
        },
      },
    },
    {
      title: '认证状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      valueType: 'select',
      search: true,
      valueEnum: {
        [UserStatusEnum.UNAUTHENTICATED]: {
          text: UserStatusTextMap[UserStatusEnum.UNAUTHENTICATED],
          status: 'Default',
        },
        [UserStatusEnum.UNDER_REVIEW]: {
          text: UserStatusTextMap[UserStatusEnum.UNDER_REVIEW],
          status: 'Processing',
        },
        [UserStatusEnum.COMPLETED]: {
          text: UserStatusTextMap[UserStatusEnum.COMPLETED],
          status: 'Success',
        },
        [UserStatusEnum.REJECTED]: {
          text: UserStatusTextMap[UserStatusEnum.REJECTED],
          status: 'Error',
        },
      },
      render: (_, record) => {
        const statusConfig = {
          [UserStatusEnum.UNAUTHENTICATED]: {color: 'default', text: UserStatusTextMap[UserStatusEnum.UNAUTHENTICATED]},
          [UserStatusEnum.UNDER_REVIEW]: {color: 'processing', text: UserStatusTextMap[UserStatusEnum.UNDER_REVIEW]},
          [UserStatusEnum.REJECTED]: {color: 'error', text: UserStatusTextMap[UserStatusEnum.REJECTED]},
          [UserStatusEnum.COMPLETED]: {color: 'success', text: UserStatusTextMap[UserStatusEnum.COMPLETED]},
        };
        const config = statusConfig[record.status as UserStatusEnum] || statusConfig[UserStatusEnum.UNAUTHENTICATED];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '注册时间',
      dataIndex: 'createdTime',
      key: 'createdTime',
      width: 180,
      search: false,
      valueType: 'dateTime',
      sorter: true,
    },
    {
      title: '最后登录时间',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      width: 180,
      search: false,
      valueType: 'dateTime',
      sorter: true,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      search: false,
      width: 280,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space size={4}>
          {record.status === UserStatusEnum.UNDER_REVIEW && (
            <AccessBtnAuth authority={AdminAccess.USER_LIST_UPDATE}>
              <Button
                type="link"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  setSelectedUserForAudit(record);
                  setAuditModalVisible(true);
                }}
                style={{ color: '#52c41a', fontWeight: 500 }}
              >
                审核
              </Button>
            </AccessBtnAuth>
          )}
          <AccessBtnAuth authority={AdminAccess.USER_LIST_UPDATE}>
            <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>
              详情
            </Button>
          </AccessBtnAuth>
        </Space>
      ),
    },
  ];

  /**
   * 获取用户列表数据
   */
  const fetchUserList = async (params: any) => {
    const requestParams: UserPageParams = {
      page: params.current,
      size: params.pageSize,
      username: params.username,
      phone: params.phone,
      status: params.status,
      gender: params.gender
    };

    try {
      const response: any = await getUserPage(requestParams);
      // 适配后端返回的Page对象
      return {
        data: response.data?.records || [],
        success: response.code === '200',
        total: response.data?.total || 0,
        current: response.data?.current || 1,
        pageSize: response.data?.size || 10,
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
   * 查看用户详情
   */
  const handleView = async (record: UserVO) => {
    const {data} = await getUserById(record.userId)
    setViewingRecord(data);
    setModalVisible(true);
  };

  /**
   * 关闭模态框
   */
  const handleCancel = () => {
    setModalVisible(false);
    setViewingRecord(null);
  };

  return (
    <PageContainer header={{
      title: '',
      breadcrumb: {},
    }}>
      <ProTable<UserVO>
        columns={columns}
        actionRef={actionRef}
        request={fetchUserList}
        rowKey="userId"
        cardBordered
        search={{
          labelWidth: 120,
        }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        dateFormatter="string"
        scroll={{x: 1000}}
        options={{
          density: true,
          fullScreen: true,
          reload: true,
          setting: true,
        }}
      />
      <Modal
        title="用户详情"
        open={modalVisible}
        onCancel={handleCancel}
        width={600}
        destroyOnHidden
        cancelText="关闭"
        centered={false}
        footer={null}
      >
        {modalVisible && <UserForm initialValues={viewingRecord || undefined} readOnly />}
      </Modal>

      <UserAuthAuditModal
        userId={selectedUserForAudit?.userId || 0}
        visible={auditModalVisible}
        onCancel={() => {
          setAuditModalVisible(false);
          setSelectedUserForAudit(null);
        }}
        onSuccess={() => {
          actionRef.current?.reload();
        }}
      />

    </PageContainer>
  );
};

export default UserList;

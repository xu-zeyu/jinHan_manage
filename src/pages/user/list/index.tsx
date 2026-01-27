import type {ActionType, ProColumns} from '@ant-design/pro-components';
import {PageContainer, ProTable} from '@ant-design/pro-components';
import {Button, Modal, Tag, Space, App, message} from 'antd';
import {PlusOutlined, LockOutlined, CheckCircleOutlined, EyeOutlined} from '@ant-design/icons';
import React, {useRef, useState} from 'react';
import {useIntl} from '@umijs/max';
import {
  getUserPage,
  getUserById,
  createUser,
  deleteUser,
  resetUserPassword,
  freezeUser
} from '@/services/user';
import type {UserVO, UserFormVO, UserPageParams} from '@/services/user/types';
import {UserStatusEnum, UserStatusTextMap, GenderEnum, GenderTextMap} from '@/services/user/types';
import UserForm, {UserFormRef} from './components/UserForm';
import UserAuthAuditModal from '../components/UserAuthAuditModal';
import AccessBtnAuth from '@/components/AccessBtnAuth';
import {AdminAccess} from '@/common/data';

const UserList: React.FC = () => {
  const intl = useIntl();
  const {modal} = App.useApp();
  const actionRef = useRef<ActionType>(null);
  const formRef = useRef<UserFormRef>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<UserVO | null>(null);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserVO | null>(null);
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
          <AccessBtnAuth authority={AdminAccess.USER_LIST_UPDATE}>
            <Button
              type="link"
              size="small"
              icon={<LockOutlined/>}
              onClick={() => handleResetPassword(record)}
            >
              重置密码
            </Button>
          </AccessBtnAuth>
          <AccessBtnAuth authority={AdminAccess.USER_LIST_DELETE}>
            <Button type="link" size="small" danger onClick={() => handleDelete(record)}>
              删除
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
   * 打开新增模态框
   */
  const handleCreate = () => {
    setViewingRecord(null);
    setModalVisible(true);
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
   * 删除用户
   */
  const handleDelete = (record: UserVO) => {
    modal.confirm({
      title: '确认删除',
      content: `确定要删除用户 "${record.username || record.phone}" 吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await deleteUser(record.userId);
          if (response.code === '200') {
            message.success('删除成功');
            actionRef.current?.reload();
          }
        } catch (error) {
          modal.error({
            title: '删除失败',
          });
        }
      },
    });
  };

  /**
   * 重置密码
   */
  const handleResetPassword = (record: UserVO) => {
    setSelectedUser(record);
    setPasswordModalVisible(true);
  };

  /**
   * 确认重置密码
   */
  const confirmResetPassword = async (newPassword: string) => {
    if (!selectedUser) return;

    try {
      const response = await resetUserPassword(selectedUser.userId, newPassword);
      if (response.code === '200') {
        message.success('密码重置成功');
        setPasswordModalVisible(false);
        setSelectedUser(null);
      }
    } catch (error) {
      modal.error({
        title: '密码重置失败',
      });
    }
  };

  /**
   * 冻结用户
   */
  const handleFreeze = (record: UserVO) => {
    modal.confirm({
      title: '确认冻结',
      content: `确定要冻结用户 "${record.username || record.phone}" 吗？冻结后用户将无法登录。`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await freezeUser(record.userId, true);
          if (response.code === '200') {
            message.success('冻结成功');
            actionRef.current?.reload();
          }
        } catch (error) {
          modal.error({
            title: '冻结失败',
          });
        }
      },
    });
  };

  /**
   * 解冻用户
   */
  const handleUnfreeze = (record: UserVO) => {
    modal.confirm({
      title: '确认解冻',
      content: `确定要解冻用户 "${record.username || record.phone}" 吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await freezeUser(record.userId, false);
          if (response.code === '200') {
            message.success('解冻成功');
            actionRef.current?.reload();
          }
        } catch (error) {
          modal.error({
            title: '解冻失败',
          });
        }
      },
    });
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
        toolBarRender={() => [
          <AccessBtnAuth authority={AdminAccess.USER_LIST_CREATE} key="create">
            <Button key="create" type="primary" icon={<PlusOutlined/>} onClick={handleCreate}>
              新建用户
            </Button>
          </AccessBtnAuth>,
        ]}
      />
      <Modal
        title={viewingRecord ? '用户详情' : '新建用户'}
        open={modalVisible}
        onCancel={handleCancel}
        width={600}
        destroyOnHidden
        cancelText="关闭"
        centered={false}
        footer={viewingRecord ? null : (
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel}>取消</Button>
            <Button type="primary">提交</Button>
          </Space>
        )}
      >
        {modalVisible && <UserForm ref={formRef} initialValues={viewingRecord || undefined} readOnly={!!viewingRecord} />}
      </Modal>

      <Modal
        title="重置密码"
        open={passwordModalVisible}
        onOk={() => {
          const newPassword = prompt('请输入新密码：');
          if (newPassword) {
            confirmResetPassword(newPassword);
          }
        }}
        onCancel={() => {
          setPasswordModalVisible(false);
          setSelectedUser(null);
        }}
        width={400}
      >
        <div>确定要重置用户 "{selectedUser?.username || selectedUser?.phone}" 的密码吗？</div>
        <div style={{marginTop: 10, color: '#8c8c8c', fontSize: '12px'}}>
          点击确认后，请在弹出的输入框中输入新密码。
        </div>
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

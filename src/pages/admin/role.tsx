import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { PageContainer, ProTable, ModalForm } from '@ant-design/pro-components';
import { Button, Modal, App, Space, Form, Input, Tree } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined, CloudUploadOutlined } from '@ant-design/icons';
import React, { useRef, useState, useEffect } from 'react';
import { useIntl } from '@umijs/max';
import { getRolePage, getRoleById, createRole, updateRole, deleteRole, getRolePermissions, assignRolePermissions } from '@/services/admin';
import { syncPermissionsToBackend, getBackendPermissions, generatePermissionTree, convertCheckedKeysToPermissionIds } from '@/services/admin/permissionSync';
import type { AdminRoleVO, AdminPermissionVO } from '@/services/admin/types';
import { AdminAccess, AdminRole} from '@/common/data';

const AdminRoleList: React.FC = () => {
  const intl = useIntl();
  const { message } = App.useApp();
  const actionRef = useRef<ActionType>(null);
  const formRef = useRef<ProFormInstance>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<AdminRoleVO | null>(null);
  const [loading, setLoading] = useState(false);
  const [permissionLoading, setPermissionLoading] = useState(false);
  const [allPermissions, setAllPermissions] = useState<AdminPermissionVO[]>([]);
  const [rolePermissions, setRolePermissions] = useState<number[]>([]);
  const [currentRoleId, setCurrentRoleId] = useState<number | null>(null);

  /**
   * 判断是否为超级管理员角色
   * 超级管理员角色名包含"超级管理员"或"SUB_ADMIN"
   */
  const isSuperAdminRole = (record: AdminRoleVO): boolean => {
    return record.rname.includes('超级管理员') || record.rname.includes('SUB_ADMIN');
  };

  /**
   * 表格列配置
   */
  const columns: ProColumns<AdminRoleVO>[] = [
    {
      title: intl.formatMessage({ id: 'pages.admin.role.id' }),
      dataIndex: 'id',
      key: 'id',
      width: 80,
      search: false,
    },
    {
      title: intl.formatMessage({ id: 'pages.admin.role.name' }),
      dataIndex: 'rname',
      key: 'rname',
      width: 150,
      search: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.admin.role.description' }),
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true,
      search: false,
    },
    {
      title: intl.formatMessage({ id: 'pages.admin.role.createdTime' }),
      dataIndex: 'createdTime',
      key: 'createdTime',
      width: 150,
      valueType: 'dateTime',
      search: false,
      sorter: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.admin.role.updatedTime' }),
      dataIndex: 'updatedTime',
      key: 'updatedTime',
      width: 150,
      valueType: 'dateTime',
      search: false,
      sorter: true,
    },
    {
      title: intl.formatMessage({ id: 'pages.admin.role.operation' }),
      dataIndex: 'operation',
      key: 'operation',
      width: 180,
      fixed: 'right',
      align: 'center',
      search: false,
      render: (_, record) => {
        const isSuperAdmin = isSuperAdminRole(record);

        return (
          <Space size={0}>
            {!isSuperAdmin && (
              <Button
                type="link"
                size="small"
                icon={<KeyOutlined />}
                style={{ padding: '0 4px' }}
                onClick={() => handleAssignPermissions(record)}
              >
                {intl.formatMessage({ id: 'pages.admin.role.assignPermissions' })}
              </Button>
            )}
            {!isSuperAdmin && (
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                style={{ padding: '0 4px' }}
                onClick={() => handleEdit(record)}
              >
                {intl.formatMessage({ id: 'pages.admin.role.edit' })}
              </Button>
            )}
            {!isSuperAdmin && (
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
                style={{ padding: '0 4px' }}
                onClick={() => handleDelete(record)}
              >
                {intl.formatMessage({ id: 'pages.admin.role.delete' })}
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  /**
   * 获取角色列表数据
   */
  const fetchRoleList = async (params: any) => {
    const requestParams = {
      page: params.current,
      size: params.pageSize,
      rname: params.rname,
    };

    try {
      const response: any = await getRolePage(requestParams);
      return {
        data: response.data?.records || [],
        success: response.code === '200',
        total: response.data?.total || 0,
      };
    } catch (error) {
      message.error('获取角色列表失败');
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  /**
   * 打开新增/编辑模态框
   */
  const handleCreate = () => {
    setEditingRole(null);
    setModalVisible(true);
  };

  /**
   * 编辑角色
   */
  const handleEdit = async (record: AdminRoleVO) => {
    // 超级管理员角色不允许编辑
    if (isSuperAdminRole(record)) {
      message.warning('超级管理员角色不允许编辑');
      return;
    }

    try {
      const response: any = await getRoleById(record.id);
      if (response.code === '200') {
        setEditingRole(response.data);
        setModalVisible(true);
      }
    } catch (error) {
      message.error('获取角色详情失败');
    }
  };

  /**
   * 删除角色
   */
  const handleDelete = (record: AdminRoleVO) => {
    // 超级管理员角色不允许删除
    if (isSuperAdminRole(record)) {
      message.warning('超级管理员角色不允许删除');
      return;
    }

    Modal.confirm({
      title: intl.formatMessage({ id: 'pages.admin.role.confirmDelete' }),
      content: `${record.rname}`,
      onOk: async () => {
        try {
          const response = await deleteRole(record.id);
          if (response.code === '200') {
            message.success(intl.formatMessage({ id: 'pages.admin.role.deleteSuccess' }));
            actionRef.current?.reload();
          }
        } catch (error) {
          message.error(intl.formatMessage({ id: 'pages.admin.role.deleteFailed' }));
        }
      },
    });
  };

  /**
   * 提交表单
   */
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      if (editingRole) {
        // 编辑模式
        await updateRole({
          id: editingRole.id,
          rname: values.rname,
          description: values.description,
        });
        message.success(intl.formatMessage({ id: 'pages.admin.role.updateSuccess' }));
      } else {
        // 新增模式
        await createRole({
          rname: values.rname,
          description: values.description,
        });
        message.success(intl.formatMessage({ id: 'pages.admin.role.createSuccess' }));
      }

      setModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      message.error(intl.formatMessage({ id: editingRole ? 'pages.admin.role.updateFailed' : 'pages.admin.role.createFailed' }));
    } finally {
      setLoading(false);
    }
  };

  /**
   * 同步权限到后端
   */
  const handleSyncPermissions = async () => {
    Modal.confirm({
      title: intl.formatMessage({ id: 'pages.admin.role.permissionSyncTitle' }),
      content: intl.formatMessage({ id: 'pages.admin.role.permissionSyncContent' }),
      onOk: async () => {
        try {
          setPermissionLoading(true);
          const response: any = await syncPermissionsToBackend(intl);
          if (response.code === '200') {
            message.success(intl.formatMessage({ id: 'pages.admin.role.permissionSyncSuccess' }));
          }
        } catch (error) {
          message.error(intl.formatMessage({ id: 'pages.admin.role.permissionSyncFailed' }));
        } finally {
          setPermissionLoading(false);
        }
      },
    });
  };

  /**
   * 分配权限
   */
  const handleAssignPermissions = async (record: AdminRoleVO) => {
    // 超级管理员角色不允许分配权限（默认拥有所有权限）
    if (isSuperAdminRole(record)) {
      message.warning('超级管理员默认拥有所有权限，无需分配');
      return;
    }

    setCurrentRoleId(record.id);
    setPermissionModalVisible(true);
    setPermissionLoading(true);

    try {
      // 获取角色已分配的权限编码（从权限ID转换）
      const rolePermsRes: any = await getRolePermissions(record.id);
      const rolePermissionCodes = (rolePermsRes.data || []).map((perm: AdminPermissionVO) => perm.code);
      
      console.log('后端返回的权限列表:', rolePermissionCodes);

      // 只过滤出按钮级别的权限作为初始选中状态
      // 页面和模块的选中状态由 generatePermissionTree 自动计算
      const buttonPermissions = rolePermissionCodes.filter((code) =>
        Object.values(AdminAccess).includes(code as AdminAccess)
      );
      
      console.log('过滤后的按钮权限:', buttonPermissions);

      // 生成权限树，并设置勾选状态
      // 只传递按钮权限，让 generatePermissionTree 自动计算页面和模块的显示状态
      const treeData = generatePermissionTree(intl, buttonPermissions);
      setAllPermissions(treeData);
      console.log('生成的权限树:', treeData);

      // 使用按钮权限作为初始选中状态
      setRolePermissions(buttonPermissions);
    } catch (error) {
      console.log(error)
      message.error(intl.formatMessage({ id: 'pages.admin.role.getPermissionFailed' }));
    } finally {
      setPermissionLoading(false);
    }
  };

  /**
   * 保存权限分配
   */
  const handleSavePermissions = async () => {
    if (!currentRoleId) return;

    try {
      setPermissionLoading(true);

      // 从后端获取所有权限，用于将权限编码转换为ID
      const backendPerms = await getBackendPermissions();
      const permissionIds = convertCheckedKeysToPermissionIds(rolePermissions, backendPerms);

      const response = await assignRolePermissions({
        roleId: currentRoleId,
        permissionIds,
      });

      if (response.code === '200') {
        message.success(intl.formatMessage({ id: 'pages.admin.role.assignSuccess' }));
        setPermissionModalVisible(false);
        setRolePermissions([]);
        setCurrentRoleId(null);
      }
    } catch (error) {
      message.error(intl.formatMessage({ id: 'pages.admin.role.assignFailed' }));
    } finally {
      setPermissionLoading(false);
    }
  };

  /**
   * 关闭权限模态框
   */
  const handlePermissionCancel = () => {
    setPermissionModalVisible(false);
    setRolePermissions([]);
    setCurrentRoleId(null);
  };

  /**
   * 从权限编码获取对应的页面权限编码
   */
  const getPagePermissionCode = (permCode: string): string | null => {
    for (const moduleKey of Object.keys(AdminRole)) {
      const module = AdminRole[moduleKey];
      for (const pageKey of Object.keys(module)) {
        const pagePermissions = module[pageKey];
        if (pagePermissions.includes(permCode as AdminAccess)) {
          return pageKey;
        }
      }
    }
    return null;
  };

  /**
   * 权限树选中变化
   * 确保页面权限被正确包含
   * 当 checkStrictly={true} 时，checkedKeys 格式为 { checked: [], halfChecked: [] }
   */
  const handlePermissionTreeCheck = (checkedKeys: any) => {
    // 处理 checkStrictly={true} 时的对象格式
    const checked = checkedKeys.checked || checkedKeys;
    setRolePermissions(checked);
  };

  return (
    <App>
      <PageContainer>
        <ProTable<AdminRoleVO>
          columns={columns}
          actionRef={actionRef}
          request={fetchRoleList}
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
            <Button
              key="syncPermissions"
              type="default"
              icon={<CloudUploadOutlined />}
              onClick={handleSyncPermissions}
            >
              {intl.formatMessage({ id: 'pages.admin.role.syncPermissions' })}
            </Button>,
            <Button
              key="create"
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              {intl.formatMessage({ id: 'pages.admin.role.create' })}
            </Button>,
          ]}
        />

        <ModalForm
          title={editingRole ? intl.formatMessage({ id: 'pages.admin.role.edit' }) : intl.formatMessage({ id: 'pages.admin.role.create' })}
          open={modalVisible}
          onOpenChange={setModalVisible}
          formRef={formRef}
          onFinish={handleSubmit}
          width={500}
          modalProps={{
            destroyOnHidden: true,
          }}
          initialValues={editingRole || {}}
        >
          <Form.Item
            name="rname"
            label={intl.formatMessage({ id: 'pages.admin.role.name' })}
            rules={[{ required: true, message: intl.formatMessage({ id: 'pages.admin.role.nameRequired' }) }]}
          >
            <Input placeholder={intl.formatMessage({ id: 'pages.admin.role.namePlaceholder' })} />
          </Form.Item>
          <Form.Item
            name="description"
            label={intl.formatMessage({ id: 'pages.admin.role.description' })}
          >
            <Input.TextArea placeholder={intl.formatMessage({ id: 'pages.admin.role.descriptionPlaceholder' })} rows={3} />
          </Form.Item>
        </ModalForm>

        {/* 权限分配模态框 */}
        <Modal
          title={intl.formatMessage({ id: 'pages.admin.role.permissionModalTitle' })}
          open={permissionModalVisible}
          onOk={handleSavePermissions}
          onCancel={handlePermissionCancel}
          width={800}
          confirmLoading={permissionLoading}
        >
          <div style={{ marginTop: 24 }}>
            <Tree
              checkable
              checkStrictly={true}
              checkedKeys={rolePermissions}
              onCheck={handlePermissionTreeCheck}
              treeData={allPermissions}
              loading={permissionLoading}
              height={400}
            />
          </div>
        </Modal>
      </PageContainer>
    </App>
  );
};

export default AdminRoleList;

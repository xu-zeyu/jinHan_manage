/**
 * 用户认证审核弹窗组件
 */
import React, {useEffect, useState} from 'react';
import {Button, Descriptions, Divider, message, Modal, Space, Tag} from 'antd';
import {useIntl} from '@umijs/max';
import {auditUserAuth, getUserAuthInfo} from '@/services/user';
import {AuditStatusEnum, AuditStatusTextMap, GenderTextMap, UserAuthInfoVO} from '@/services/user/types';

interface UserAuthAuditModalProps {
  userId: number;
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const UserAuthAuditModal: React.FC<UserAuthAuditModalProps> = ({
  userId,
  visible,
  onCancel,
  onSuccess,
}) => {
  const intl = useIntl();
  const [authInfo, setAuthInfo] = useState<UserAuthInfoVO | null>(null);
  const [loading, setLoading] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);

  // 获取认证信息
  const fetchAuthInfo = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response: any = await getUserAuthInfo(userId);
      if (response.code === '200') {
        setAuthInfo(response.data);
      } else {
        message.error('获取认证信息失败');
      }
    } catch (error) {
      message.error('获取认证信息失败');
    } finally {
      setLoading(false);
    }
  };

  // 审核操作
  const handleAudit = async (status: AuditStatusEnum) => {
    try {
      setAuditLoading(true);
      const response: any = await auditUserAuth(userId, status);
      if (response.code === '200') {
        message.success(`审核${status === AuditStatusEnum.APPROVED ? '通过' : '拒绝'}成功`);
        onSuccess();
        onCancel();
      } else {
        message.error('审核失败');
      }
    } catch (error) {
      message.error('审核失败');
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchAuthInfo();
    } else {
      setAuthInfo(null);
    }
  }, [visible, userId]);

  // 获取状态标签颜色
  const getStatusColor = (status?: AuditStatusEnum) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Modal
      title="用户认证审核"
      open={visible}
      onCancel={onCancel}
      width={800}
      style={{ top: 20 }}
      footer={
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>取消</Button>
          <Button
            type="primary"
            danger
            onClick={() => handleAudit(AuditStatusEnum.REJECTED)}
            loading={auditLoading}
            disabled={authInfo?.auditStatus !== 'PENDING'}
          >
            拒绝
          </Button>
          <Button
            type="primary"
            onClick={() => handleAudit(AuditStatusEnum.APPROVED)}
            loading={auditLoading}
            disabled={authInfo?.auditStatus !== 'PENDING'}
          >
            通过
          </Button>
        </Space>
      }
    >
      <Descriptions
        column={2}
        bordered
        size="middle"
        styles={{ label: { width: 120, fontWeight: 600, background: '#fafafa' } }}
      >
        <Descriptions.Item label="真实姓名">
          {authInfo?.realName || '-'}
        </Descriptions.Item>

        <Descriptions.Item label="身份证号">
          {authInfo?.idNumber || '-'}
        </Descriptions.Item>

        <Descriptions.Item label="性别">
          {authInfo?.gender ? GenderTextMap[authInfo.gender] : '-'}
        </Descriptions.Item>

        <Descriptions.Item label="审核状态">
          {authInfo?.auditStatus ? (
            <Tag color={getStatusColor(authInfo.auditStatus)}>
              {AuditStatusTextMap[authInfo.auditStatus]}
            </Tag>
          ) : '-'}
        </Descriptions.Item>

        <Descriptions.Item label="有效期开始" span={2}>
          {authInfo?.validStartDate || '-'}
        </Descriptions.Item>

        <Descriptions.Item label="有效期结束" span={2}>
          {authInfo?.validEndDate || '-'}
        </Descriptions.Item>

        <Descriptions.Item label="提交时间" span={2}>
          {authInfo?.createdTime || '-'}
        </Descriptions.Item>
      </Descriptions>

      <Divider style={{ margin: '16px 0' }} />

      <div style={{ textAlign: 'center', color: '#8c8c8c', fontSize: '12px' }}>
        请仔细核对用户信息，确认无误后进行审核操作
      </div>
    </Modal>
  );
};

export default UserAuthAuditModal;

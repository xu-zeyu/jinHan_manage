import React, { forwardRef, useImperativeHandle } from 'react';
import { Form, Input, Select, Radio } from 'antd';
import type { UserVO, UserStatusEnum } from '@/services/user/types';
import { UserStatusTextMap } from '@/services/user/types';

export interface UserFormRef {
  getValues: () => Promise<any>;
  validateFields: () => Promise<any>;
  setFieldsValue: (values: any) => void;
  resetFields: () => void;
}

interface UserFormProps {
  initialValues?: UserVO;
  readOnly?: boolean;
}

const UserForm = forwardRef<UserFormRef, UserFormProps>((props, ref) => {
  const { initialValues, readOnly } = props;
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    getValues: () => form.getFieldsValue(),
    validateFields: () => form.validateFields(),
    setFieldsValue: (values: any) => form.setFieldsValue(values),
    resetFields: () => form.resetFields(),
  }));

  const statusOptions = Object.entries(UserStatusTextMap).map(([value, label]) => ({
    label,
    value,
  }));

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        status: initialValues?.status || 'UNAUTHENTICATED',
        ...initialValues,
      }}
    >
      <Form.Item
        name="username"
        label="用户名"
        rules={readOnly ? undefined : [
          { required: true, message: '请输入用户名' },
          { min: 2, message: '用户名长度至少为2个字符' },
          { max: 50, message: '用户名长度不能超过50个字符' },
        ]}
      >
        <Input placeholder="请输入用户名" disabled={readOnly} />
      </Form.Item>

      <Form.Item
        name="phone"
        label="手机号"
        rules={readOnly ? undefined : [
          { required: true, message: '请输入手机号' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式' },
        ]}
      >
        <Input placeholder="请输入手机号" disabled={!!initialValues?.userId} />
      </Form.Item>

      {!initialValues?.userId && (
        <Form.Item
          name="password"
          label="密码"
          rules={[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码长度至少为6个字符' },
            { max: 20, message: '密码长度不能超过20个字符' },
          ]}
        >
          <Input.Password placeholder="请输入密码" />
        </Form.Item>
      )}

      <Form.Item
        name="status"
        label="认证状态"
        rules={[{ required: true, message: '请选择认证状态' }]}
      >
        <Radio.Group>
          {statusOptions.map(option => (
            <Radio key={option.value} value={option.value}>
              {option.label}
            </Radio>
          ))}
        </Radio.Group>
      </Form.Item>
    </Form>
  );
});

UserForm.displayName = 'UserForm';

export default UserForm;

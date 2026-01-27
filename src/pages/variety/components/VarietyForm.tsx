/**
 * 品种表单组件
 */
import React, { useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import { Modal, Form, Input, InputNumber, Upload, Switch, App } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import type { VarietyFormVO } from '@/services/variety/types';
import { createVariety, updateVariety } from '@/services/variety';
import ImgUpload from '@/components/ImgUpload';

const { TextArea } = Input;

export interface VarietyFormRef {
  getValues: () => Promise<VarietyFormVO>;
  setValues: (values: Partial<VarietyFormVO>) => void;
  resetFields: () => void;
}

interface VarietyFormProps {
  visible: boolean;
  title: string;
  initialValues?: Partial<VarietyFormVO> | null;
  onOk: () => void;
  onCancel: () => void;
}

const VarietyForm = forwardRef<VarietyFormRef, VarietyFormProps>(
  ({ visible, title, initialValues, onOk, onCancel }, ref) => {
    const intl = useIntl();
    const { message } = App.useApp();
    const [form] = Form.useForm<VarietyFormVO>();
    const [confirmLoading, setConfirmLoading] = useState(false);

    useImperativeHandle(ref, () => ({
      getValues: async () => {
        try {
          const values = await form.validateFields();
          return values;
        } catch (error) {
          throw error;
        }
      },
      setValues: (values) => {
        form.setFieldsValue(values);
      },
      resetFields: () => {
        form.resetFields();
      },
    }));

    useEffect(() => {
      if (visible) {
        if (initialValues) {
          form.setFieldsValue(initialValues);
        } else {
          form.resetFields();
          form.setFieldsValue({
            status: 1,
            sortOrder: 0,
          });
        }
      }
    }, [visible, initialValues, form]);

    const handleOk = async () => {
      try {
        const values = await form.validateFields();
        setConfirmLoading(true);

        const response = initialValues?.id
          ? await updateVariety(values)
          : await createVariety(values);

        if (response.code === '200') {
          message.success(
            initialValues?.id
              ? intl.formatMessage({ id: 'variety.message.updateSuccess' })
              : intl.formatMessage({ id: 'variety.message.createSuccess' })
          );
          onOk();
        } else {
          message.error(response.message || intl.formatMessage({ id: 'variety.message.saveFailed' }));
        }
      } catch (error) {
        if (error instanceof Error && error.message === 'Failed to fetch') {
          message.error(intl.formatMessage({ id: 'app.request.failed' }));
        }
      } finally {
        setConfirmLoading(false);
      }
    };

    const handleCancel = () => {
      form.resetFields();
      onCancel();
    };

    return (
      <Modal
        title={title}
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={confirmLoading}
        width={600}
        maskClosable={false}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 1,
            sortOrder: 0,
          }}
        >
          {initialValues?.id && (
            <Form.Item name="id" hidden>
              <Input />
            </Form.Item>
          )}

          <Form.Item
            name="name"
            label={intl.formatMessage({ id: 'variety.form.name' })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: 'variety.form.nameRequired' }),
              },
              {
                max: 100,
                message: intl.formatMessage({ id: 'variety.form.nameMaxLength' }),
              },
            ]}
          >
            <Input placeholder={intl.formatMessage({ id: 'variety.form.namePlaceholder' })} />
          </Form.Item>

          <Form.Item
            name="iconUrl"
            label={intl.formatMessage({ id: 'variety.form.iconUrl' })}
          >
            <ImgUpload maxCount={1} accept="image/*" />
          </Form.Item>

          <Form.Item
            name="minPrice"
            label={intl.formatMessage({ id: 'variety.form.minPrice' })}
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: 'variety.form.minPriceRequired' }),
              },
            ]}
          >
            <InputNumber
              min={0}
              precision={2}
              style={{ width: '100%' }}
              placeholder={intl.formatMessage({ id: 'variety.form.minPricePlaceholder' })}
            />
          </Form.Item>

          <Form.Item
            name="sortOrder"
            label={intl.formatMessage({ id: 'variety.form.sortOrder' })}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              placeholder={intl.formatMessage({ id: 'variety.form.sortOrderPlaceholder' })}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label={intl.formatMessage({ id: 'variety.form.status' })}
            valuePropName="checked"
          >
            <Switch
              checkedChildren={intl.formatMessage({ id: 'variety.status.on' })}
              unCheckedChildren={intl.formatMessage({ id: 'variety.status.off' })}
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
);

VarietyForm.displayName = 'VarietyForm';

export default VarietyForm;

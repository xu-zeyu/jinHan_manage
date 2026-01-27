import React from 'react';
import { Modal, Form, Input } from 'antd';
import type { FormInstance } from 'antd/es/form';

interface ShippingFormModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  form: FormInstance;
  initialValues?: any;
  isEdit: boolean;
}

const ShippingFormModal: React.FC<ShippingFormModalProps> = ({
  visible,
  onCancel,
  onSubmit,
  form,
  initialValues,
  isEdit,
}) => {
  return (
    <Modal
      title={isEdit ? '编辑发货记录' : '新建发货记录'}
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      width={600}
      okText="确认"
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={initialValues}
      >
        {!isEdit && (
          <Form.Item
            name="orderId"
            label="订单号"
            rules={[{ required: true, message: '请输入订单号' }]}
          >
            <Input placeholder="请输入订单号" />
          </Form.Item>
        )}
        
        <Form.Item
          name="logisticsCompany"
          label="物流公司"
          rules={[{ required: true, message: '请输入物流公司名称' }]}
        >
          <Input placeholder="请输入物流公司名称，如：顺丰速运、圆通快递等" />
        </Form.Item>
        
        <Form.Item
          name="logisticsNo"
          label="物流单号"
          rules={[{ required: true, message: '请输入物流单号' }]}
        >
          <Input placeholder="请输入物流单号" />
        </Form.Item>
        
        <Form.Item
          name="shippingAddress"
          label="发货地址"
          rules={[{ required: true, message: '请输入发货地址' }]}
        >
          <Input.TextArea rows={3} placeholder="请输入详细的发货地址" />
        </Form.Item>
        
        <Form.Item
          name="remark"
          label="备注"
        >
          <Input.TextArea rows={3} placeholder="请输入备注信息（可选）" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ShippingFormModal;

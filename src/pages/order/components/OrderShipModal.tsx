import React from 'react';
import { Modal, Form, Input, message } from 'antd';
import type { FormInstance } from 'antd/es/form';
import { shipOrder } from '@/services/order';
import type { OrderVO } from '@/services/order/types';

interface OrderShipModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  order: OrderVO | null;
}

const OrderShipModal: React.FC<OrderShipModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  order,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (!order) return;

      const response = await shipOrder(order.orderId, values.logisticsCompany, values.logisticsNo);
      
      if (response.code === '200') {
        message.success('发货操作成功');
        form.resetFields();
        onSuccess();
      }
    } catch (error) {
      if (error.errorFields) {
        // 表单验证错误
        return;
      }
      message.error('发货操作失败');
    }
  };

  return (
    <Modal
      title="订单发货"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={600}
      okText="确认发货"
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          orderId: order?.orderId,
        }}
      >
        <Form.Item label="订单号">
          <strong>{order?.orderId}</strong>
        </Form.Item>
        
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
          name="remark"
          label="备注"
        >
          <Input.TextArea rows={3} placeholder="请输入备注信息（可选）" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default OrderShipModal;

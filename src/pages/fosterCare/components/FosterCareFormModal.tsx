import React from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Select } from 'antd';
import type { FormInstance } from 'antd/es/form';
import moment from 'moment';
import { createFosterCare, updateFosterCare } from '@/services/fosterCare';
import type { FosterCareStatusEnum } from '@/services/fosterCare/types';
import { message } from 'antd';

interface FosterCareFormModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmitSuccess: () => void;
  form: FormInstance;
  initialValues?: any;
  isEdit: boolean;
  recordId?: number;
}

const { TextArea } = Input;
const { Option } = Select;

const FosterCareFormModal: React.FC<FosterCareFormModalProps> = ({
  visible,
  onCancel,
  onSubmitSuccess,
  form,
  initialValues,
  isEdit,
  recordId,
}) => {
  const handleSubmit = async (values: any) => {
    try {
      // 格式化日期
      const formatDate = (date: any) => {
        if (!date) return '';
        if (moment.isMoment(date)) {
          return date.format('YYYY-MM-DD HH:mm:ss');
        }
        return date;
      };

      const submitData = {
        ...values,
        fosterStartDate: formatDate(values.fosterStartDate),
        fosterEndDate: formatDate(values.fosterEndDate),
      };

      let response;
      if (isEdit && recordId) {
        response = await updateFosterCare({
          id: recordId,
          ...submitData,
        });
      } else {
        response = await createFosterCare(submitData);
      }

      if (response.code === '200') {
        message.success(isEdit ? '更新成功' : '创建成功');
        onSubmitSuccess();
      }
    } catch (error) {
      message.error(isEdit ? '更新失败' : '创建失败');
    }
  };

  return (
    <Modal
      title={isEdit ? '编辑寄养记录' : '新增寄养记录'}
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      width={700}
      okText="确认"
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialValues}
      >
        <Form.Item
          name="petId"
          label="宠物ID"
          rules={[{ required: true, message: '请输入宠物ID' }]}
        >
          <InputNumber 
            placeholder="请输入宠物ID" 
            style={{ width: '100%' }}
            min={1}
          />
        </Form.Item>

        <Form.Item
          name="petName"
          label="宠物名称"
          rules={[{ required: true, message: '请输入宠物名称' }]}
        >
          <Input placeholder="请输入宠物名称" />
        </Form.Item>

        <Form.Item
          name="petType"
          label="宠物类型"
          rules={[{ required: true, message: '请选择宠物类型' }]}
        >
          <Select placeholder="请选择宠物类型">
            <Option value="CAT">猫</Option>
            <Option value="DOG">狗</Option>
            <Option value="BIRD">鸟类</Option>
            <Option value="RABBIT">兔子</Option>
            <Option value="OTHER">其他</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="ownerName"
          label="主人姓名"
          rules={[{ required: true, message: '请输入主人姓名' }]}
        >
          <Input placeholder="请输入主人姓名" />
        </Form.Item>

        <Form.Item
          name="ownerPhone"
          label="联系电话"
          rules={[
            { required: true, message: '请输入联系电话' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
          ]}
        >
          <Input placeholder="请输入联系电话" />
        </Form.Item>

        <Form.Item
          name="fosterStartDate"
          label="寄养开始日期"
          rules={[{ required: true, message: '请选择寄养开始日期' }]}
        >
          <DatePicker 
            showTime 
            placeholder="请选择寄养开始日期" 
            style={{ width: '100%' }}
            format="YYYY-MM-DD HH:mm:ss"
          />
        </Form.Item>

        <Form.Item
          name="fosterEndDate"
          label="寄养结束日期"
          rules={[{ required: true, message: '请选择寄养结束日期' }]}
        >
          <DatePicker 
            showTime 
            placeholder="请选择寄养结束日期" 
            style={{ width: '100%' }}
            format="YYYY-MM-DD HH:mm:ss"
          />
        </Form.Item>

        <Form.Item
          name="fosterPrice"
          label="寄养单价（元/天）"
          rules={[{ required: true, message: '请输入寄养单价' }]}
        >
          <InputNumber 
            placeholder="请输入寄养单价" 
            style={{ width: '100%' }}
            min={0}
            precision={2}
            step={0.01}
          />
        </Form.Item>

        <Form.Item
          name="fosterAddress"
          label="寄养地址"
          rules={[{ required: true, message: '请输入寄养地址' }]}
        >
          <TextArea rows={3} placeholder="请输入详细寄养地址" />
        </Form.Item>

        <Form.Item
          name="specialRequirements"
          label="特殊要求"
        >
          <TextArea rows={3} placeholder="请输入特殊要求（可选）" />
        </Form.Item>

        <Form.Item
          name="remark"
          label="备注"
        >
          <TextArea rows={3} placeholder="请输入备注信息（可选）" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FosterCareFormModal;

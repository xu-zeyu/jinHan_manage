/**
 * 品种快速添加弹窗 - 根据外部数据格式
 */
import React, { useState } from 'react';
import { Modal, Input, App } from 'antd';
import { useIntl } from '@umijs/max';
import { createVariety } from '@/services/variety';

const { TextArea } = Input;

interface VarietyQuickAddModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ExternalVarietyData {
  id?: number;
  name: string;
  iconUrl?: string;
  minPrice: string | number;
}

const VarietyQuickAddModal: React.FC<VarietyQuickAddModalProps> = ({ visible, onClose, onSuccess }) => {
  const intl = useIntl();
  const { message } = App.useApp();
  const [jsonText, setJsonText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    if (!jsonText.trim()) {
      message.error('请输入品种数据');
      return;
    }

    try {
      setLoading(true);
      const data = JSON.parse(jsonText);

      // 支持数组或单个对象
      const varieties = Array.isArray(data) ? data : [data];

      let successCount = 0;
      let failCount = 0;

      for (const item of varieties) {
        try {
          // 验证必填字段
          if (!item.name) {
            message.warning(`数据缺失品种名称: ${JSON.stringify(item)}`);
            failCount++;
            continue;
          }
          if (!item.minPrice) {
            message.warning(`数据缺失最低价格: ${item.name}`);
            failCount++;
            continue;
          }

          // 转换为数字
          const minPrice = parseFloat(String(item.minPrice));
          if (isNaN(minPrice)) {
            message.warning(`价格格式错误: ${item.minPrice}`);
            failCount++;
            continue;
          }

          // 创建品种
          const response = await createVariety({
            name: item.name,
            iconUrl: item.iconUrl || '',
            minPrice: minPrice,
            sortOrder: 0,
            status: 1,
          });

          if (response.code === '200') {
            successCount++;
          } else {
            failCount++;
            message.error(`创建失败: ${item.name} - ${response.message}`);
          }
        } catch (error) {
          failCount++;
          message.error(`创建失败: ${item.name}`);
        }
      }

      if (successCount > 0) {
        message.success(`成功创建 ${successCount} 个品种`);
        onSuccess();
      }
      if (failCount > 0) {
        message.error(`${failCount} 个品种创建失败`);
      }

      handleClose();
    } catch (error) {
      message.error('JSON格式错误，请检查数据格式');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setJsonText('');
    onClose();
  };

  return (
    <Modal
      title={intl.formatMessage({ id: 'variety.quickAdd.title' })}
      open={visible}
      onOk={handleOk}
      onCancel={handleClose}
      confirmLoading={loading}
      width={600}
      okText={intl.formatMessage({ id: 'common.create' })}
      cancelText={intl.formatMessage({ id: 'common.cancel' })}
    >
      <div style={{ marginBottom: 16 }}>
        数据格式示例：
        <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4, fontSize: 12 }}>
{`{
  "id": 46,
  "name": "波斯猫",
  "iconUrl": "https://assets.buyonepet.com/pet_category/cat_46.jpg",
  "minPrice": "1600"
}`}
        </pre>
        或数组格式：[]
      </div>
      <TextArea
        rows={10}
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        placeholder={intl.formatMessage({ id: 'variety.quickAdd.placeholder' })}
      />
    </Modal>
  );
};

export default VarietyQuickAddModal;

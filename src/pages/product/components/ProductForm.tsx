/**
 * 商品表单组件
 */
import React, { useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import { Form, Input, InputNumber, Select, Switch, Row, Col, Button, Tabs, App, Spin, DatePicker } from 'antd';
import { useIntl } from '@umijs/max';
import type { ProductFormVO } from '@/services/product/types';
import { Editor, Toolbar } from '@wangeditor/editor-for-react';
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor';
import { uploadFile } from '@/services/upload';
import ImgUpload from '@/components/ImgUpload';
import { getVarietyList, getVarietyById } from '@/services/variety';
import type { VarietyVO } from '@/services/variety/types';
import '@wangeditor/editor/dist/css/style.css';
import './index.less';

const { TextArea } = Input;
const { Option } = Select;

export interface ProductFormRef {
  getValues: () => Promise<ProductFormVO>;
  setValues: (values: Partial<ProductFormVO>) => void;
  resetFields: () => void;
}

interface ProductFormProps {
  initialValues?: Partial<ProductFormVO>;
}

const ProductForm = forwardRef<ProductFormRef, ProductFormProps>(({ initialValues }, ref) => {
  const intl = useIntl();
  const { message } = App.useApp();
  const [form] = Form.useForm<ProductFormVO>();

  // wangEditor 状态
  const [editor, setEditor] = useState<IDomEditor | null>(null);
  const [html, setHtml] = useState('');

  // 品种列表状态
  const [varietyOptions, setVarietyOptions] = useState<VarietyVO[]>([]);
  const [varietyLoading, setVarietyLoading] = useState(false);

  // 获取所有品种列表
  const fetchVarietyList = async () => {
    setVarietyLoading(true);
    try {
      const response = await getVarietyList();
      if (response.code === '200') {
        setVarietyOptions(response.data || []);
      }
    } catch (error) {
      console.error('获取品种列表失败:', error);
    } finally {
      setVarietyLoading(false);
    }
  };

  // 处理品种选择变化
  const handleVarietyChange = (value: number) => {
    form.setFieldValue('varietyType', value);
  };

  // 编辑器配置
  const editorConfig: Partial<IEditorConfig> = {
    placeholder: intl.formatMessage({ id: 'product.form.detailPlaceholder' }),
    MENU_CONF: {
      uploadImage: {
        // 自定义上传
        async customUpload(file: File, insertFn: any) {
          try {
            const response = await uploadFile(file);
            const url = response.data;
            insertFn(url, file.name, url);
          } catch (error) {
            message.error(intl.formatMessage({ id: 'product.message.uploadFailed' }));
          }
        },
        // 限制图片大小
        maxFileSize: 5 * 1024 * 1024, // 5M
        // 限制图片类型
        allowedFileTypes: ['image/*'],
        // 最多上传数量
        maxNumberOfFiles: 10,
      },
    },
  };

  const toolbarConfig: Partial<IToolbarConfig> = {
    excludeKeys: ['uploadVideo', 'insertVideo'],
  };

  // 组件挂载时获取品种列表
  useEffect(() => {
    fetchVarietyList();
  }, []);

  // 组件销毁时销毁编辑器
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
        setEditor(null);
      }
    };
  }, [editor]);

  useImperativeHandle(ref, () => ({
    getValues: async () => {
      try {
        const values = await form.validateFields();
        // 确保富文本内容被包含
        if (html) {
          values.description = html;
        }
        // 将 images 数组转换为 JSON 字符串（后端期望的是 JSON 字符串）
        if (values.images && Array.isArray(values.images)) {
          values.images = JSON.stringify(values.images);
        }
        return values;
      } catch (error) {
        throw error;
      }
    },
    setValues: (values) => {
      const formValues = { ...values };
      // 将 images JSON 字符串转换为数组
      if (values?.images && typeof values.images === 'string') {
        try {
          formValues.images = JSON.parse(values.images);
        } catch (error) {
          formValues.images = [];
        }
      }

      // 确保 birthday 是有效的值，避免引发验证错误
      if (values?.birthday === null || values?.birthday === undefined || values?.birthday === '' || values?.birthday === 'Invalid Date') {
        delete formValues.birthday; // 删除无效值，让表单使用默认值
      }

      // 使用 setTimeout 确保表单完全准备好后再设置值
      setTimeout(() => {
        form.setFieldsValue(formValues);
      }, 0);

      // 设置富文本内容
      setHtml(values?.description || '');
    },
    resetFields: () => {
      form.resetFields();
      setHtml('');
    },
  }));

  // 根据品种ID获取品种信息
  const fetchVarietyById = async (id: number) => {
    try {
      const response = await getVarietyById(id);
      if (response.code === '200' && response.data) {
        return response.data;
      }
    } catch (error) {
      console.error('获取品种信息失败:', error);
    }
    return null;
  };

  useEffect(() => {
    const initializeForm = async () => {
      if (initialValues) {
        const formValues = {
          ...initialValues,
        };

        // 将 images JSON 字符串转换为数组
        if (initialValues.images && typeof initialValues.images === 'string') {
          try {
            formValues.images = JSON.parse(initialValues.images);
          } catch (error) {
            formValues.images = [];
          }
        }

        // 如果存在品种ID，获取品种信息并设置选项
        if (initialValues.varietyType) {
          const variety = await fetchVarietyById(initialValues.varietyType);
          if (variety) {
            setVarietyOptions([variety]);
          }
        }

        form.setFieldsValue(formValues);
        // 设置富文本内容
        setHtml(initialValues.description || '');
      } else {
        setHtml('');
      }
    };

    initializeForm();
  }, [initialValues, form]);

  return (
    <div className="productFormWrapper">
      <Form form={form} layout="vertical" size="middle" className="productForm">
        <Tabs
          defaultActiveKey="basic"
          size="small"
          className="formTabs"
          items={[
            {
              key: 'basic',
              label: intl.formatMessage({ id: 'product.form.basicInfo' }),
              children: (
                <div className="tabContent">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="name"
                        label={intl.formatMessage({ id: 'product.form.name' })}
                        rules={[{ required: true, message: intl.formatMessage({ id: 'product.form.nameRequired' }) }]}
                      >
                        <Input size="middle" placeholder={intl.formatMessage({ id: 'product.form.namePlaceholder' })} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={6}>
                      <Form.Item name="status" label={intl.formatMessage({ id: 'product.form.status' })} initialValue={0}>
                        <Select size="middle">
                          <Option value={0}>{intl.formatMessage({ id: 'product.status.off' })}</Option>
                          <Option value={1}>{intl.formatMessage({ id: 'product.status.on' })}</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name="activityCategory" label={intl.formatMessage({ id: 'product.form.activityCategory' })} initialValue={0}>
                        <Select size="middle" placeholder={intl.formatMessage({ id: 'product.form.activityCategoryPlaceholder' })}>
                          <Option value={0}>无活动</Option>
                          <Option value={1}>促销活动</Option>
                          <Option value={2}>新品活动</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name="originPrice" label={intl.formatMessage({ id: 'product.form.originPrice' })} initialValue={0}>
                        <InputNumber size="middle" style={{ width: '100%' }} min={0} placeholder={intl.formatMessage({ id: 'product.form.originPricePlaceholder' })} />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name="price" label={intl.formatMessage({ id: 'product.form.price' })} initialValue={0}>
                        <InputNumber size="middle" style={{ width: '100%' }} min={0} placeholder={intl.formatMessage({ id: 'product.form.pricePlaceholder' })} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item name="varietyType" label={intl.formatMessage({ id: 'product.form.varietyType' })}>
                        <Select
                          size="middle"
                          style={{ width: '100%' }}
                          placeholder={intl.formatMessage({ id: 'product.form.varietyTypePlaceholder' })}
                          allowClear
                          loading={varietyLoading}
                          onChange={handleVarietyChange}
                        >
                          {varietyOptions.map(variety => (
                            <Option key={variety.id} value={variety.id}>
                              {variety.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="gender" label={intl.formatMessage({ id: 'product.form.gender' })} initialValue={1}>
                        <Select size="middle" style={{ width: '100%' }}>
                          <Option value={1}>雄性</Option>
                          <Option value={0}>雌性</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="birthday"
                        label={intl.formatMessage({ id: 'product.form.birthday' })}
                      >
                        <Input size="middle" placeholder={intl.formatMessage({ id: 'product.form.birthdayPlaceholder' })} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item name="title" label={intl.formatMessage({ id: 'product.form.title' })}>
                    <Input size="middle" placeholder={intl.formatMessage({ id: 'product.form.titlePlaceholder' })} />
                  </Form.Item>

                  <Form.Item name="description" label={intl.formatMessage({ id: 'product.form.description' })}>
                    <TextArea size="middle" rows={2} placeholder={intl.formatMessage({ id: 'product.form.descriptionPlaceholder' })} />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="mainImage"
                        label={intl.formatMessage({ id: 'product.form.mainImage' })}
                      >
                        <ImgUpload maxCount={1} accept="image/*" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="images"
                        label={intl.formatMessage({ id: 'product.form.images' })}
                      >
                        <ImgUpload maxCount={9} accept="image/*" />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              key: 'more',
              label: intl.formatMessage({ id: 'product.form.moreInfo' }),
              children: (
                <div className="tabContent">
                  <Form.Item
                    name="detail"
                    label={intl.formatMessage({ id: 'product.form.detail' })}
                    tooltip={intl.formatMessage({ id: 'product.form.detailTooltip' })}
                  >
                    <div style={{ border: '1px solid #d9d9d9', borderRadius: '8px', overflow: 'hidden' }}>
                      <Toolbar
                        editor={editor}
                        defaultConfig={toolbarConfig}
                        mode="default"
                        style={{ borderBottom: '1px solid #e8e8e8', backgroundColor: '#fafafa' }}
                      />
                      <Editor
                        defaultConfig={editorConfig}
                        value={html}
                        onCreated={setEditor}
                        onChange={(editor) => {
                          const newHtml = editor.getHtml();
                          setHtml(newHtml);
                          form.setFieldValue('detail', newHtml);
                        }}
                        mode="default"
                        style={{ height: 400, overflowY: 'hidden' }}
                      />
                    </div>
                  </Form.Item>
                </div>
              ),
            },
          ]}
        />
      </Form>
    </div>
  );
});

ProductForm.displayName = 'ProductForm';

export default ProductForm;

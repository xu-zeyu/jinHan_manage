/**
 * 商品外部数据导入弹窗
 */
import React, { useState, useRef } from 'react';
import { Modal, Input, Form, InputNumber, Select, Switch, Space, Button, message, Tabs, Row, Col, Card, Tag, Divider, Descriptions, Image } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { createProduct } from '@/services/product';
import type { ProductFormVO } from '@/services/product/types';
import { searchVarietyByName } from '@/services/variety';

const { TextArea } = Input;

export interface ProductExternalImportModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ExternalProductData {
  goodsId: string;
  attach: {
    coverType: number;
    photoList: string[];
    video?: string;
  };
  name: string;
  coverType: number;
  coverUrl: string;
  categoryType: number;
  originPrice: string;
  price: string;
  priceType: number;
  specialPrice: string;
  eachDayFqPrice: string;
  goodsBadge: {
    leftUrl: string;
    rightUrl: string;
  };
  status: number;
  isExcellence: number;
  isShipFree: number;
  isPremium: number;
  publishAt: string;
  title: string;
  gender: number;
  kcStatus: number;
  birthday: string;
  description: string;
  deliveryRemark: string;
  deliveryList: any[];
  healthRemark: string;
  healthList: any[];
  parentList: any;
  serviceTagRemark: string;
  serviceTagList: any[];
  petTagList: any[];
  goodsActivity: any;
  shop: {
    shopId: string;
    userId: string;
    nickname: string;
    avatarUrl: string;
    onSaleNum: number;
    areaName: string;
    certList: number[];
    tagType: number;
    gradeLevel: number;
    orderCompleteNum: number;
    excellenceCommentNum: number;
  };
}

const ProductExternalImportModal: React.FC<ProductExternalImportModalProps> = ({ visible, onClose, onSuccess }) => {
  const intl = useIntl();
  const [jsonText, setJsonText] = useState('');
  const [products, setProducts] = useState<ExternalProductData[]>([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const parseData = () => {
    if (!jsonText.trim()) {
      message.error('请输入商品数据');
      return;
    }

    try {
      const data = JSON.parse(jsonText);
      const productList = Array.isArray(data) ? data : [data];
      
      // 验证数据格式
      const validProducts = productList.filter((item: any) => {
        if (!item.name || !item.goodsId) {
          message.warning(`数据格式错误，缺少必要字段: ${JSON.stringify(item)}`);
          return false;
        }
        return true;
      });
      
      setProducts(validProducts);
      message.success(`成功解析 ${validProducts.length} 条商品数据`);
    } catch (error) {
      message.error('JSON格式错误，请检查数据格式');
      setProducts([]);
    }
  };

  const removeProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleImport = async () => {
    if (products.length === 0) {
      message.error('没有可导入的商品数据');
      return;
    }

    setLoading(true);
    let successCount = 0;
    let failCount = 0;

    for (const product of products) {
      try {
        // 不做任何修改，直接使用原始图片链接
        const getImagesList = (): string[] => {
          if (product.attach?.photoList) {
            return product.attach.photoList;
          }
          return [];
        };

        // 转换外部数据格式为内部格式
        const formData: ProductFormVO = {
          name: product.name,
          title: product.title || product.name,
          description: product.description || '',
          mainImage: product.coverUrl || '',
          images: JSON.stringify(getImagesList()),
          originPrice: product.originPrice ? parseFloat(product.originPrice) : 0,
          price: product.price ? parseFloat(product.price) : 0,
          status: product.status || 1,
          isExcellence: product.isExcellence || 0,
          isShipFree: product.isShipFree || 0,
          gender: product.gender === 2 ? 0 : 1, // 2=雌性, 1=雄性
          birthday: product.birthday || undefined,
          activityCategory: 0, // 默认无活动
        };

        // 查找品种
        if (product.name) {
          try {
            const searchResult = await searchVarietyByName(product.name);
            if (searchResult.code === '200' && searchResult.data.records.length > 0) {
              formData.varietyType = searchResult.data.records[0].id;
            }
          } catch (error) {
            console.log('品种搜索失败:', error);
          }
        }

        const response = await createProduct(formData);
        if (response.code === '200') {
          successCount++;
        } else {
          failCount++;
          message.error(`创建失败: ${product.name} - ${response.message}`);
        }
      } catch (error) {
        failCount++;
        message.error(`创建失败: ${product.name}`);
      }
    }

    setLoading(false);
    
    if (successCount > 0) {
      message.success(`成功创建 ${successCount} 个商品`);
      onSuccess();
      handleClose();
    }
    if (failCount > 0) {
      message.error(`${failCount} 个商品创建失败`);
    }
  };

  const handleClose = () => {
    setJsonText('');
    setProducts([]);
    onClose();
  };

  const transformGender = (gender: number) => {
    const genderMap: Record<number, string> = {
      1: '雄性',
      2: '雌性',
      0: '未知',
    };
    return genderMap[gender] || '未知';
  };

  return (
    <Modal
      title={intl.formatMessage({ id: 'product.externalImport.title' })}
      open={visible}
      onOk={handleImport}
      onCancel={handleClose}
      confirmLoading={loading}
      width={1200}
      style={{ top: 20 }}
      styles={{
        body: {
          maxHeight: '80vh',
          overflowY: 'auto'
        }
      }}
      okText={intl.formatMessage({ id: 'product.externalImport.confirm' })}
      cancelText={intl.formatMessage({ id: 'common.cancel' })}
    >
        <Tabs
        items={[
          {
            key: 'input',
            label: intl.formatMessage({ id: 'product.externalImport.inputTab' }),
            children: (
              <div style={{ padding: '16px 0' }}>
                <div style={{ marginBottom: 16 }}>
                  {intl.formatMessage({ id: 'product.externalImport.example' })}:
                  <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4, fontSize: 12, overflowX: 'auto' }}>
{`{
  "goodsId": "243343",
  "name": "布偶猫",
  "coverUrl": "https://example.com/image.jpg",
  "price": "1099",
  "title": "正八大开脸布偶妹妹",
  "gender": 2,
  "birthday": "2025-11-15",
  "description": "商品描述"
}`}
                  </pre>
                </div>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <TextArea
                    rows={8}
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    placeholder={intl.formatMessage({ id: 'product.externalImport.placeholder' })}
                  />
                  <Button type="primary" onClick={parseData}>
                    {intl.formatMessage({ id: 'product.externalImport.parse' })}
                  </Button>
                </Space>
              </div>
            ),
          },
          {
            key: 'preview',
            label: `${intl.formatMessage({ id: 'product.externalImport.previewTab' })} (${products.length})`,
            children: (
              <div style={{ padding: '16px 0' }}>
                {products.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
                    {intl.formatMessage({ id: 'product.externalImport.noData' })}
                  </div>
                ) : (
                  <div>
                    {products.map((product, index) => (
                      <Card
                        key={product.goodsId}
                        size="small"
                        title={
                          <Space>
                            <span>{product.name}</span>
                            <Tag color="blue">{product.goodsId}</Tag>
                          </Space>
                        }
                        extra={
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => removeProduct(index)}
                          />
                        }
                        style={{ marginBottom: 16 }}
                      >
                        <Row gutter={16}>
                          <Col span={6}>
                            {product.coverUrl ? (
                              <Image
                                src={product.coverUrl}
                                alt={product.name}
                                style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 4 }}
                              />
                            ) : (
                              <div style={{ width: '100%', height: 120, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                暂无图片
                              </div>
                            )}
                          </Col>
                          <Col span={18}>
                            <Descriptions size="small" column={2}>
                              <Descriptions.Item label="价格">
                                <span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>¥{product.price}</span>
                              </Descriptions.Item>
                              <Descriptions.Item label="原价">
                                {product.originPrice ? `¥${product.originPrice}` : '-'}
                              </Descriptions.Item>
                              <Descriptions.Item label="性别">
                                {transformGender(product.gender)}
                              </Descriptions.Item>
                              <Descriptions.Item label="生日">
                                {product.birthday || '-'}
                              </Descriptions.Item>
                              <Descriptions.Item label="标题" span={2}>
                                {product.title}
                              </Descriptions.Item>
                              <Descriptions.Item label="状态" span={2}>
                                <Space>
                                  <Tag color={product.status === 1 ? 'green' : 'red'}>
                                    {product.status === 1 ? '上架' : '下架'}
                                  </Tag>
                                  {product.isExcellence === 1 && <Tag color="gold">优选</Tag>}
                                  {product.isShipFree === 1 && <Tag color="blue">包邮</Tag>}
                                </Space>
                              </Descriptions.Item>
                            </Descriptions>
                            {product.shop && (
                              <>
                                <Divider style={{ margin: '12px 0' }} />
                                <Space>
                                  <span>商家: {product.shop.nickname}</span>
                                  <Tag>等级: {product.shop.gradeLevel}</Tag>
                                  <span>地区: {product.shop.areaName}</span>
                                </Space>
                              </>
                            )}
                          </Col>
                        </Row>
                        {product.description && (
                          <>
                            <Divider style={{ margin: '12px 0' }} />
                            <div>
                              <strong>描述: </strong>
                              <div style={{ 
                                maxHeight: 100, 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis',
                                fontSize: 12,
                                color: '#666',
                                marginTop: 8
                              }}>
                                {product.description}
                              </div>
                            </div>
                          </>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />
    </Modal>
  );
};

export default ProductExternalImportModal;

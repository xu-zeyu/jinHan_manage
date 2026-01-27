import type {ActionType, ProColumns} from '@ant-design/pro-components';
import {PageContainer, ProTable} from '@ant-design/pro-components';
import {Button, Modal, Tag, Image, Space, App} from 'antd';
import {PlusOutlined, UploadOutlined, ShoppingCartOutlined} from '@ant-design/icons';
import React, {useRef, useState} from 'react';
import {useIntl} from '@umijs/max';
import {getProductPage, getProductById, createProduct, updateProduct, deleteProduct} from '@/services/product';
import type {ProductVO, ProductFormVO, ProductPageParams} from '@/services/product/types';
import {createOrder} from '@/services/order';
import ProductForm, {ProductFormRef} from './components/ProductForm';
import ProductExternalImportModal from './components/ProductExternalImportModal';
import AccessBtnAuth from '@/components/AccessBtnAuth';
import {AdminAccess} from '@/common/data';
import {getVarietyList} from "@/services/variety";

const ProductList: React.FC = () => {
  const intl = useIntl();
  const {modal} = App.useApp();
  const actionRef = useRef<ActionType>(null);
  const formRef = useRef<ProductFormRef>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ProductVO | null>(null);
  const [loading, setLoading] = useState(false);
  const [externalImportVisible, setExternalImportVisible] = useState(false);

  /**
   * 表格列配置 - 简约风格，支持筛选
   */
  const columns: ProColumns<ProductVO>[] = [
    {
      title: intl.formatMessage({id: 'product.table.productInfo'}),
      key: 'productInfo',
      dataIndex: 'name',
      search: {
        transform: (value) => ({ name: value }),
      },
      width: 280,
      render: (_, record) => {
        // 解析图片列表
        let allImages: string[] = [];
        if (record.images) {
          try {
            const imagesArray = JSON.parse(record.images);
            if (Array.isArray(imagesArray)) {
              allImages = [...imagesArray].filter(Boolean);
            }
          } catch (error) {
            // 解析失败，忽略 images 字段
          }
        }

        const imageCount = allImages.length;
        return (
          <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <div style={{position: 'relative', flexShrink: 0}}>
              <Image.PreviewGroup items={allImages}>
                <Image
                  width={56}
                  height={56}
                  src={record.mainImage}
                  style={{
                    borderRadius: 4,
                    objectFit: 'cover',
                  }}
                  fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHZpZXdCb3g9IjAgMCA1NiA1NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNCIgZmlsbD0iI0Y1RjVGNSIvPgo8cGF0aCBkPSJNMjggMzBDMjkuMTA0NiAzMCAzMCAyOS4xMDQ2IDMwIDI4QzMwIDI2Ljg5NTQgMjkuMTA0NiAyNiAyOCAyNkMyNi44OTU0IDI2IDI2IDI2Ljg5NTQgMjYgMjhDMjYgMjkuMTA0NiAyNi44OTU0IDMwIDI4IDMwWiIgZmlsbD0iI0Q4RDhEOCIvPgo8L3N2Zz4K"
                />
              </Image.PreviewGroup>
              {imageCount > 1 && (
                <div style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  background: '#1890ff',
                  color: '#fff',
                  fontSize: '10px',
                  padding: '1px 5px',
                  borderRadius: '8px',
                  minWidth: '16px',
                  textAlign: 'center',
                  fontWeight: 600,
                }}>
                  {imageCount}
                </div>
              )}
            </div>
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{
                fontWeight: 600,
                fontSize: '14px',
                color: '#1f1f1f',
                marginBottom: 4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {record.name}
              </div>
              <div style={{fontSize: '12px', color: '#595959', marginBottom: 4}}>
               {record.birthday}
              </div>
              <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                <span style={{fontSize: '15px', fontWeight: 600, color: '#ff4d4f'}}>
                  ¥{record.price ?? 0}
                </span>
                <span style={{textDecoration: 'line-through', color: '#8c8c8c', fontSize: '11px'}}>
                    ¥{record.originPrice}
                  </span>
              </div>
              {record.title && (
                <div style={{
                  fontSize: '11px',
                  color: '#8c8c8c',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginTop: 4,
                }}>
                  {record.title}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: '品种',
      dataIndex: 'varietyType',
      key: 'varietyType',
      width: 100,
      search: {
        transform: (value) => ({ varietyType: value }),
      },
      valueType: 'select',
      request: async ({ keyWords }: { keyWords?: string }) => {
        try {
          const response = await getVarietyList({ name: keyWords });
          if (response.code === '200') {
            return (response.data || []).map((variety: any) => ({
              label: variety.name,
              value: variety.id,
            }));
          }
          return [];
        } catch (error) {
          return [];
        }
      },
      render: (_, record) => {
        return record.variety ? (
          <Tag color="blue" style={{fontSize: '12px', padding: '4px 8px'}}>
            {record.variety.name}
          </Tag>
        ) : (
          <Tag style={{fontSize: '12px', padding: '4px 8px'}}>-</Tag>
        );
      },
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 60,
      search: true,
      valueType: 'select',
      valueEnum: {
        0: { text: '雌', status: 'Default' },
        1: { text: '雄', status: 'Success' },
      },
      render: (_, record) => (
        <Tag color={record.gender === 1 ? 'green' : 'orange'} style={{fontSize: '11px', padding: '2px 6px', minWidth: '30px', textAlign: 'center'}}>
          {record.gender === 1 ? '雄' : '雌'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 70,
      valueType: 'select',
      search: true,
      valueEnum: {
        0: {
          text: '下架',
          status: 'Default',
        },
        1: {
          text: '上架',
          status: 'Success',
        },
      },
      render: (_, record) => (
        <Tag color={record.status === 1 ? 'green' : 'default'} style={{fontSize: '11px', padding: '2px 6px'}}>
          {record.status === 1 ? '上架' : '下架'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdTime',
      key: 'createdTime',
      search: false,
      width: 80,
      valueType: 'dateTime',
      sorter: true,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      search: false,
      width: 120,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space size={0}>
          <Button
            type="link"
            size="small"
            icon={<ShoppingCartOutlined />}
            style={{padding: '0 4px'}}
            onClick={() => handleCreateOrder(record)}
          >
            下单
          </Button>
          <AccessBtnAuth authority={AdminAccess.PRODUCT_LIST_UPDATE}>
            <Button
              type="link"
              size="small"
              style={{padding: '0 4px'}}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          </AccessBtnAuth>
          <AccessBtnAuth authority={AdminAccess.PRODUCT_LIST_DELETE}>
            <Button
              type="link"
              size="small"
              danger
              style={{padding: '0 4px'}}
              onClick={() => handleDelete(record)}
            >
              删除
            </Button>
          </AccessBtnAuth>
        </Space>
      ),
    },
  ];

  /**
   * 获取商品列表数据
   */
  const fetchProductList = async (params: any) => {
    const requestParams: ProductPageParams = {
      page: params.current,
      size: params.pageSize,
      name: params.name,
      status: params.status,
      varietyType: params.varietyType,
      gender: params.gender,
    };

    try {
      const response: any = await getProductPage(requestParams);
      return {
        data: response.data?.records || [],
        success: response.code === '200',
        total: response.data?.total || 0,
      };
    } catch (error) {
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
    setEditingRecord(null);
    setModalVisible(true);
  };

  /**
   * 打开外部数据导入模态框
   */
  const handleExternalImport = () => {
    setExternalImportVisible(true);
  };

  /**
   * 处理外部数据导入成功
   */
  const handleExternalImportSuccess = () => {
    actionRef.current?.reload();
  };

  /**
   * 创建订单
   */
  const handleCreateOrder = async (record: ProductVO) => {
    modal.confirm({
      title: '确认下单',
      content: `确定要为商品 "${record.name}" 创建订单吗？`,
      onOk: async () => {
        try {
          const response = await createOrder({
            goodsId: record.id,
            quantity: 1,
          });
          if (response.code === '200') {
            modal.success({
              content: '订单创建成功',
            });
          }
        } catch (error) {
          modal.error({
            title: '订单创建失败',
            content: error instanceof Error ? error.message : '未知错误',
          });
        }
      },
    });
  };

  /**
   * 处理关闭外部数据导入模态框
   */
  const handleExternalImportClose = () => {
    setExternalImportVisible(false);
  };

  /**
   * 编辑商品
   */
  const handleEdit = async (record: ProductVO) => {
    try {
      const response: any = await getProductById(record.id);
      if (response.code === '200') {
        setEditingRecord(response.data);
        setModalVisible(true);
      }
    } catch (error) {
      modal.error({
        title: intl.formatMessage({id: 'product.message.fetchDetailFailed'}),
      });
    }
  };

  /**
   * 删除商品
   */
  const handleDelete = (record: ProductVO) => {
    modal.confirm({
      title: intl.formatMessage({id: 'product.modal.deleteConfirm'}),
      content: intl.formatMessage({id: 'product.modal.deleteConfirmContent'}, {name: record.name}),
      okText: intl.formatMessage({id: 'common.yes'}),
      cancelText: intl.formatMessage({id: 'common.no'}),
      onOk: async () => {
        try {
          const response = await deleteProduct(record.id);
          if (response.code === '200') {
            modal.success({
              content: intl.formatMessage({id: 'product.message.deleteSuccess'}),
            });
            actionRef.current?.reload();
          }
        } catch (error) {
          modal.error({
            title: intl.formatMessage({id: 'product.message.deleteFailed'}),
          });
        }
      },
    });
  };

  /**
   * 提交表单
   */
  const handleSubmit = async () => {
    if (!formRef.current) return;

    try {
      setLoading(true);
      const formData = await formRef.current.getValues();

      // 编辑时需要确保传递 id
      const submitData: ProductFormVO = {
        ...formData,
      };
      // 如果是编辑模式，确保 id 存在
      if (editingRecord && editingRecord.id) {
        submitData.id = editingRecord.id;
      }

      // 确保 birthday 是字符串格式
      if (submitData.birthday && typeof submitData.birthday !== 'string') {
        submitData.birthday = String(submitData.birthday);
      }

      const response = editingRecord ? await updateProduct(submitData) : await createProduct(submitData);

      if (response.code === '200') {
        modal.success({
          content: intl.formatMessage({id: editingRecord ? 'product.message.updateSuccess' : 'product.message.createSuccess'}),
        });
        setModalVisible(false);
        actionRef.current?.reload();
      }
    } catch (error) {
      modal.error({
        title: intl.formatMessage({id: editingRecord ? 'product.message.updateFailed' : 'product.message.createFailed'}),
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 关闭模态框
   */
  const handleCancel = () => {
    setModalVisible(false);
    setEditingRecord(null);
  };

  return (
    <PageContainer>
      <ProTable<ProductVO>
        columns={columns}
        actionRef={actionRef}
        request={fetchProductList}
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
          <AccessBtnAuth authority={AdminAccess.PRODUCT_LIST_CREATE} key="create">
            <Button
              key="create"
              type="primary"
              icon={<PlusOutlined/>}
              onClick={handleCreate}
            >
              {intl.formatMessage({id: 'product.button.create'})}
            </Button>
          </AccessBtnAuth>,
          <AccessBtnAuth authority={AdminAccess.PRODUCT_LIST_CREATE} key="externalImport">
            <Button
              key="externalImport"
              icon={<UploadOutlined/>}
              onClick={handleExternalImport}
            >
              {intl.formatMessage({id: 'product.button.externalImport'})}
            </Button>
          </AccessBtnAuth>,
        ]}
      />

      <Modal
        title={editingRecord ? intl.formatMessage({id: 'product.modal.editTitle'}) : intl.formatMessage({id: 'product.modal.createTitle'})}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={1100}
        style={{top: 20}}
        destroyOnHidden
        okText={editingRecord ? intl.formatMessage({id: 'product.button.confirmUpdate'}) : intl.formatMessage({id: 'product.button.confirmCreate'})}
        cancelText={intl.formatMessage({id: 'common.cancel'})}
        confirmLoading={loading}
        centered={false}
        styles={{
          body: {
            maxHeight: 'calc(100vh - 180px)',
            overflowY: 'auto',
          },
        }}
      >
        {modalVisible && <ProductForm ref={formRef} initialValues={editingRecord || undefined}/>}
      </Modal>

      <ProductExternalImportModal
        visible={externalImportVisible}
        onClose={handleExternalImportClose}
        onSuccess={handleExternalImportSuccess}
      />
    </PageContainer>
  );
};

export default ProductList;

import {PlusOutlined} from '@ant-design/icons';
import type {ActionType, ProColumns} from '@ant-design/pro-components';
import {PageContainer, ProTable} from '@ant-design/pro-components';
import {Button} from 'antd';
import React, {useRef} from 'react';
import {bannerByOneApi, bannerListApi} from "@/services/banner";
import {ProFormInstance} from "@ant-design/pro-form/lib";
import dayjs from "dayjs";
import AccessBtnAuth from "@/components/AccessBtnAuth";
import {AdminAccess} from "@/common/data";


interface BannerItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

const BannerList: React.FC = () => {

  const actionRef = useRef<ActionType>(null);
  const formRef = useRef<ProFormInstance>(undefined);


  const columns: ProColumns<BannerItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      search: false,
      width: 20,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 100,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 190,
      search: false,
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      search: true,
      width: 80,
      valueType: 'dateTime',
      // 指定查询时，表单项的value会映射到两个字段上，即startTimeBegin和startTimeEnd
      sorter: (a: any, b: any) => dayjs(a.startTime).unix() - dayjs(b.startTime).unix(),
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      search: true,
      width: 80,
      valueType: 'dateTime',
      sorter: (a: any, b: any) => dayjs(a.endTime).unix() - dayjs(b.endTime).unix(),
    },
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      search: false,
      width: 60,
      render: (cellValue: React.ReactNode, entity: BannerItem) => <>
        <AccessBtnAuth authority={AdminAccess.BANNER_LIST_UPDATE}>
          <Button color="primary" variant="text" onClick={() => handleEdit(entity)}>
            编辑
          </Button>
        </AccessBtnAuth>
        <AccessBtnAuth authority={AdminAccess.BANNER_LIST_DELETE}>
          <Button color="primary" variant="text" onClick={() => handleDelete(entity)}>
            删除
          </Button>
        </AccessBtnAuth>
      </>,

    },
  ];

  const handleEdit = async (record: BannerItem) => {
    const res = await bannerByOneApi(record.id)
  };

  const handleDelete = (record: BannerItem) => {
    console.log('删除:', record);
  };

  const fetchBanners = async (params: any) => {
    const newParams = {
      page: params.current,
      size: params.pageSize,
      ...params
    }
    delete newParams.current
    delete newParams.pageSize
    const res: any = await bannerListApi(newParams)
    return {
      data: res.data.records,
      success: res.code == "200",
      total: res.data.total,
    };
  };

  return (
    <PageContainer>
      <ProTable<BannerItem>
        columns={columns}
        actionRef={actionRef}
        formRef={formRef}
        request={fetchBanners}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{
          pageSize: 10,
        }}
        dateFormatter="string"
        toolBarRender={() => [
          <AccessBtnAuth authority={AdminAccess.BANNER_LIST_CREATE}>
            <Button
              key="button"
              icon={<PlusOutlined/>}
              onClick={() => {
                console.log('新增');
              }}
              type="primary"
            >
              新增
            </Button>
          </AccessBtnAuth>
        ]}
      />
    </PageContainer>
  );
};

export default BannerList;

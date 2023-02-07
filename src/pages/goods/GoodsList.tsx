import React, { useEffect, useRef, useState } from 'react';
import { history, useModel } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Switch, Popconfirm, Button, Select, Image, Spin, message } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { getGoodsData, updataSaleState, deleteGoods, getAllEvent } from '@/services/api';
import { imageFallback } from '@/utils/constants';

const handleModify = async (params: { goods_list: string; is_sale: number }) => {
  try {
    await updataSaleState(params);
    message.success('修改成功');
    return true;
  } catch (error) {
    message.error('修改失败请重试');
    return false;
  }
};

const handleDelete = async (params: { goods_list: string }) => {
  try {
    await deleteGoods(params);
    message.success('删除成功');
    return true;
  } catch (error) {
    message.error('删除失败请重试');
    return false;
  }
};

const GoodsList: React.FC<{}> = () => {
  const actionRef = useRef<ActionType>();
  const [allEventData, setAllEventData] = useState(null);
  const { getAllCate, cateData, getCategoryName } = useModel('dataModel');

  const getAllEventData = async () => {
    const response = await getAllEvent({});
    if (response.code === 200) {
      if ('data' in response) {
        setAllEventData(response.data);
      }
    }
  };

  useEffect(() => {
    getAllCate();
    getAllEventData();
  }, []);

  const saleStateChange = async (arrId: number[], state: boolean) => {
    const goods_list = arrId.join(',');
    const success = await handleModify({ goods_list, is_sale: state ? 1 : 2 });
    if (success) {
      if (actionRef.current) {
        actionRef.current.reload();
      }
    }
  };

  const onDelete = async (arrId: number[]) => {
    const goods_list = arrId.join(',');
    const success = await handleDelete({ goods_list });
    if (success) {
      if (actionRef.current) {
        actionRef.current.reload();
      }
    }
  };

  const renderSearchEvent = () => {
    if (allEventData) {
      return allEventData.map((item: any) => (
        <Select.Option key={item.id} value={item.id}>
          {item.name}
        </Select.Option>
      ));
    }
    return null;
  };

  const renderSearchCategory = () => {
    if (cateData) {
      return cateData.map((item: any) => (
        <Select.Option key={item.id} value={item.id}>
          {item.category_name}
        </Select.Option>
      ));
    }
    return null;
  };

  const renderImage = (id: number, data: any) => {
    if (data && data.length > 0) {
      return (
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => {
            window.open(`/goods/detail?id=${id}`);
            // history.push({
            //   pathname: '/goods/detail',
            //   query: { id },
            // });
          }}
        >
          <Image
            width={50}
            height={50}
            src={data[0]}
            preview={false}
            fallback={imageFallback}
            placeholder={<Spin />}
          />
        </div>
      );
    }
    return <img src={imageFallback} alt="img" style={{ width: 50, height: 50 }} />;
  };

  const renderSaleState = (id: number, is_sale: boolean) => {
    return (
      <Switch
        checkedChildren="上架"
        unCheckedChildren="下架"
        checked={is_sale}
        onChange={(state) => {
          saleStateChange([id], state);
        }}
      />
    );
  };

  const columns = [
    {
      title: '图片',
      key: 'image',
      width: 70,
      render: (_, record: any) => renderImage(record.id, record.pic_small_url),
      search: false,
    },
    {
      title: '名称',
      key: 'title',
      render: (_, record: any) => (
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => {
            window.open(`/goods/detail?id=${record.id}`);
            // history.push({
            //   pathname: '/goods/detail',
            //   query: { id: record.id },
            // });
          }}
        >
          {record.title}
        </div>
      ),
    },
    {
      title: '所属活动',
      key: 'event_id',
      render: (_, record: any) => <span>{record?.events?.name}</span>,
      renderFormItem: (_, props: any) => <Select {...props}>{renderSearchEvent()}</Select>,
    },
    {
      title: '类别',
      dataIndex: 'category_id',
      valueType: 'select',
      renderText: (category_id: number) => getCategoryName(category_id),
      renderFormItem: (_, props: any) => <Select {...props}>{renderSearchCategory()}</Select>,
    },
    {
      title: '品牌 - 系列',
      dataIndex: 'brand',
      search: false,
      render: (_, record: any) => <span>{`${record.brand} - ${record.series || ''}`}</span>,
    },
    {
      title: '起拍价(JPY)',
      dataIndex: 'start_price',
      search: false,
    },
    {
      title: '最后价格(JPY)',
      dataIndex: 'last_price',
      search: false,
    },
    {
      title: '上下架',
      key: 'is_sale',
      render: (record: any) => renderSaleState(record.id, record.is_sale),
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 202,
      render: (_, record: any) => [
        <a
          key="view"
          onClick={() => {
            window.open(`/goods/detail?id=${record.id}`);
            // history.push({
            //   pathname: '/goods/detail',
            //   query: { id: record.id },
            // });
          }}
        >
          <SearchOutlined />
          查看详情
        </a>,
        <a
          key="editable"
          onClick={() => {
            history.push({
              pathname: '/goods/modify',
              query: { id: record.id },
            });
          }}
        >
          <EditOutlined />
          编辑
        </a>,
        <Popconfirm
          key="delete"
          title="确认删除?"
          placement="topRight"
          onConfirm={() => {
            onDelete([record.id]);
          }}
        >
          <a>
            <DeleteOutlined />
            删除
          </a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable
        actionRef={actionRef}
        rowKey="key"
        columns={columns}
        search={{ labelWidth: 'auto' }}
        request={async (params) => {
          const { current, pageSize, title, category_id, event_id } = params;
          const tempParams = {
            page: current,
            size: pageSize,
          };
          if (title) {
            tempParams.title = title;
          }
          if (category_id) {
            tempParams.cate = category_id;
          }
          if (event_id) {
            tempParams.event_id = `${event_id}`;
          }
          const res = await getGoodsData(tempParams);
          const { code } = res;
          if (code === 200) {
            const {
              data: { items, total },
            } = res;
            const tempItems = items.map((item: any) => {
              const { id } = item;
              const key = id;
              return {
                ...item,
                key,
              };
            });
            return {
              data: tempItems,
              total,
              success: true,
            };
          }
          return {
            data: [],
            success: false,
            total: 0,
          };
        }}
        pagination={{
          showQuickJumper: true,
        }}
        rowSelection={{}}
        tableAlertOptionRender={false}
        tableAlertRender={({ selectedRowKeys }) => {
          return (
            <div>
              <span>已选 {selectedRowKeys.length} 项</span>
              {selectedRowKeys.length > 1 && (
                <div style={{ float: 'right' }}>
                  <a
                    style={{ marginRight: '25px' }}
                    onClick={() => {
                      saleStateChange(selectedRowKeys as number[], true);
                    }}
                  >
                    <ArrowUpOutlined /> 批量上架
                  </a>
                  <a
                    style={{ marginRight: '25px' }}
                    onClick={() => {
                      saleStateChange(selectedRowKeys as number[], false);
                    }}
                  >
                    <ArrowDownOutlined />
                    批量下架
                  </a>
                  <Popconfirm
                    title="确认删除?"
                    placement="topRight"
                    onConfirm={() => {
                      onDelete(selectedRowKeys as number[]);
                    }}
                  >
                    <a>
                      <DeleteOutlined />
                      批量删除
                    </a>
                  </Popconfirm>
                </div>
              )}
            </div>
          );
        }}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            onClick={() => {
              history.push('/goods/modify');
            }}
          >
            新增商品
          </Button>,
        ]}
      />
    </PageContainer>
  );
};

export default GoodsList;

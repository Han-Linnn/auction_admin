import React, { useRef, useState, useEffect } from 'react';
import { history, useModel } from 'umi';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Popconfirm, Button, Image, Select, Spin, Modal, message, Switch } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { getGoodsData, getEventDetail, modifyEvent, updataSaleState } from '@/services/api';
import { imageFallback } from '@/utils/constants';

const EventGoods: React.FC<{ props: { eid: number; type: string; listData: any } }> = (props) => {
  const { eventId, type, listData } = props;
  const actionRef = useRef<ActionType>();
  const { cateData } = useModel('dataModel');
  const [goosListData, setGoosListData] = useState<any>(null);
  const [visible, setVisible] = useState<boolean>(false);

  const gotoContainer = (anchorName: string) => {
    if (anchorName) {
      const anchorElement = document.getElementById(anchorName);
      if (anchorElement) {
        anchorElement.scrollIntoView();
      }
    }
  };

  const initGoosListData = (listData: { data: any; page: number; total: number }) => {
    const { data, page, total } = listData;
    const tempData = [...data];
    if (tempData && tempData.length > 0) {
      for (let i = 0; i < tempData.length; i += 1) {
        tempData[i].key = tempData[i].id;
      }
      setGoosListData({ data: tempData, page, total });
    }
  };

  useEffect(() => {
    initGoosListData(listData);
  }, []);

  const onGetDetail = async (params: any) => {
    const response = await getEventDetail(params);
    if (response.code === 200) {
      const { data } = response;
      initGoosListData({ data: data.items, page: data.page, total: data.total });
      if (actionRef.current) {
        actionRef.current.reload();
      }
    }
  };

  const onDelete = async (arrId: string[]) => {
    const response = await modifyEvent({
      id: eventId,
      data: { goods_id: arrId, oper_type: 'delete' },
    });
    if (response.code === 201) {
      message.success('删除成功');
      onGetDetail({
        id: eventId,
        data: {
          page: goosListData?.page,
          size: goosListData?.per_page,
        },
      });
    }
  };

  const onAdd = async (arrId: string[]) => {
    const response = await modifyEvent({
      id: eventId,
      data: { goods_id: arrId, oper_type: 'add' },
    });
    if (response.code === 201) {
      message.success('添加成功');
      onGetDetail({ id: eventId });
    }
  };

  const renderImage = (id: string, data: any) => {
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

  const getCategoryName = (cateId: number) => {
    let tempName = '-';
    if (cateData) {
      cateData.forEach((item: any) => {
        if (item.id === cateId) {
          tempName = item.category_name;
        }
      });
    }
    return tempName;
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

  const handleModify = async (params: { goods_list: string; is_sale: number }) => {
    try {
      const response = await updataSaleState(params);
      if (response.code === 201) {
        message.success('修改成功');
        return true;
      }
      message.error('修改失败请重试');
      return false;
    } catch (error) {
      message.error('修改失败请重试');
      return false;
    }
  };

  const saleStateChange = async (arrId: number[], state: boolean) => {
    const goods_list = arrId.join(',');
    const success = await handleModify({ goods_list, is_sale: state ? 1 : 2 });
    if (success) {
      onGetDetail({
        id: eventId,
        data: {
          page: goosListData?.page,
          size: goosListData?.per_page,
        },
      });
    }
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

  const columns = (isAddList: boolean) => {
    const baseColumns = [
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
        title: '类别',
        key: 'category_id',
        dataIndex: 'category_id',
        valueType: 'select',
        renderText: (category_id: number) => getCategoryName(category_id),
        renderFormItem: (_, props: any) => <Select {...props}>{renderSearchCategory()}</Select>,
      },
      {
        title: '上下架',
        key: 'is_sale',
        width: 70,
        render: (record: any) => renderSaleState(record.id, record.is_sale),
        search: false,
      },
    ];

    const modifyColumns = {
      title: '操作',
      key: 'option',
      valueType: 'option',
      width: 80,
      render: (_, record: any) =>
        isAddList
          ? [
              <a
                onClick={() => {
                  onAdd([record.id]);
                }}
              >
                <PlusOutlined />
                添加
              </a>,
            ]
          : [
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
    };

    if (type === 'modify') {
      const temp = [...baseColumns];
      temp.push(modifyColumns);
      return temp;
    }
    return baseColumns;
  };

  const renderAddGoodsModal = () => {
    return (
      <Modal
        title="选择活动商品"
        width="65%"
        visible={visible}
        destroyOnClose
        // maskClosable={false}
        onCancel={() => {
          setVisible(false);
        }}
        footer={null}
      >
        <ProTable
          rowKey="key"
          columns={columns(true)}
          search={{ labelWidth: 'auto' }}
          request={async (params) => {
            const { current, pageSize, title, category_id } = params;
            const tempParams = {
              page: current,
              size: pageSize,
              not_in_event_id: eventId,
            };
            if (title) {
              tempParams.title = title;
            }
            if (category_id) {
              tempParams.cate = category_id;
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
                {selectedRowKeys.length > 0 && (
                  <div style={{ float: 'right' }}>
                    <Popconfirm
                      title="确认添加?"
                      placement="topRight"
                      style={{ marginRight: '25px' }}
                      onConfirm={() => {
                        onAdd(selectedRowKeys as string[]);
                      }}
                    >
                      <a>
                        <PlusOutlined />
                        批量添加
                      </a>
                    </Popconfirm>
                  </div>
                )}
              </div>
            );
          }}
        />
      </Modal>
    );
  };

  return (
    <>
      <ProTable
        id="goodsTable"
        actionRef={actionRef}
        rowKey="key"
        columns={columns(false)}
        search={false}
        dataSource={goosListData?.data}
        pagination={{
          hideOnSinglePage: true,
          showQuickJumper: true,
          defaultPageSize: 20,
          current: goosListData?.page,
          total: goosListData?.total,
          onChange: (pageNum, pageSize) => {
            onGetDetail({
              id: eventId,
              data: {
                page: pageNum,
                size: pageSize,
              },
            });
            gotoContainer('goodsTable');
          },
        }}
        toolBarRender={() =>
          type === 'modify'
            ? [
                <Button
                  key="add"
                  type="primary"
                  onClick={() => {
                    setVisible(true);
                  }}
                >
                  新增活动商品
                </Button>,
              ]
            : []
        }
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
                    title="确认删除活动商品?"
                    placement="topRight"
                    onConfirm={() => {
                      onDelete(selectedRowKeys as string[]);
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
      />
      {renderAddGoodsModal()}
    </>
  );
};

export default EventGoods;

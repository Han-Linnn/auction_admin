import React, { useEffect, useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import {
  Image,
  Spin,
  Select,
  Descriptions,
  Modal,
  Popover,
  InputNumber,
  Button,
  message,
  Space,
} from 'antd';
import { useModel, history } from 'umi';
import {
  getAllEvent,
  getEventBidding,
  getBiddingHistory,
  modifyGoods,
  updataGoogsPush,
} from '@/services/api';
import { imageFallback } from '@/utils/constants';
import { EyeOutlined, SendOutlined, EditOutlined } from '@ant-design/icons';
import AutoCompleteInput from '@/components/AutoCompleteInput';

const Bidding: React.FC<{}> = () => {
  const actionRef = useRef<ActionType>();
  const { cateData, getCategoryName } = useModel('dataModel');
  const [allEventData, setAllEventData] = useState(null);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [visibleType, setVisibleType] = useState<string>('');
  // 最终拍卖价
  const [finalPrice, setFinalPrice] = useState<number>(0);
  // 选择
  const [listData, setListData] = useState(null);
  const [selectList, setSelectList] = useState<any[]>([]);

  const getAllEventData = async () => {
    const response = await getAllEvent({});
    if (response.code === 200) {
      if ('data' in response) {
        setAllEventData(response.data);
      }
    }
  };

  const modifyFinalPrice = async () => {
    if (finalPrice > 0) {
      const tempData: API.GoodsData = {
        final_price: finalPrice,
      };
      const response = await modifyGoods({
        id: currentItem?.goods?.id,
        data: tempData,
      });
      if (response.code === 201) {
        if (actionRef.current) {
          actionRef.current.reload();
        }
        message.success('编辑成功');
      }
    } else {
      message.warning('请输入最终拍卖价');
    }
  };

  const checkSelectRow = (selectedRowKeys: any) => {
    const tempRowKeys = [];
    let haveNull = false;
    if (listData && listData.length > 0 && selectedRowKeys && selectedRowKeys.length > 0) {
      listData.forEach((item: any) => {
        for (let i = 0; i < selectedRowKeys.length; i += 1) {
          const rowId = selectedRowKeys[i];
          if (item.id === rowId) {
            const { goods } = item;
            if (goods.final_price) {
              tempRowKeys.push(item.id);
            } else {
              haveNull = true;
            }
            break;
          }
        }
      });
    }
    setSelectList(tempRowKeys);
    if (haveNull) {
      Modal.warning({
        title: '发送拍卖结果',
        content: '最终拍卖价不能为空, 请检查参数',
      });
    }
  };

  const updataPushState = async () => {
    if (selectList && selectList.length > 0) {
      if (listData && listData.length > 0) {
        const temp = [];
        listData.forEach((item: any) => {
          for (let i = 0; i < selectList.length; i += 1) {
            const rowId = selectList[i];
            if (item.id === rowId) {
              const { goods } = item;
              if (goods.final_price) {
                temp.push(goods.id);
              }
              break;
            }
          }
        });
        const response = await updataGoogsPush({ goods_list: temp.join(',') });
        if (response.code === 201) {
          setSelectList([]);
          message.success('发送成功');
        }
      }
    } else {
      message.warning('请选择需要发送的商品');
    }
  };

  useEffect(() => {
    getAllEventData();
  }, []);

  const renderImage = (data: any) => {
    if (data?.goods?.pic_small_url && data?.goods?.pic_small_url.length > 0) {
      return (
        <Image
          width={50}
          height={50}
          src={data?.goods?.pic_small_url[0]}
          preview={false}
          fallback={imageFallback}
          placeholder={<Spin />}
        />
      );
    }
    if (data) {
      return (
        <Image
          width={50}
          height={50}
          src={data}
          preview={false}
          fallback={imageFallback}
          placeholder={<Spin />}
        />
      );
    }
    return <img src={imageFallback} alt="img" style={{ width: 50, height: 50 }} />;
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

  const columns = [
    {
      title: '图片',
      key: 'pic_url',
      search: false,
      render: (_, record: any) => renderImage(record),
    },
    {
      title: '拍卖品名称',
      key: 'title',
      render: (_, record: any) => <span>{record?.goods?.title}</span>,
      renderFormItem: (_, props: any) => <AutoCompleteInput {...props} />,
    },
    {
      title: '所属活动',
      key: 'event_id',
      render: (_, record: any) => <span>{record?.events?.name || '-'}</span>,
      renderFormItem: (_, props: any) => <Select {...props}>{renderSearchEvent()}</Select>,
    },
    {
      title: '类别',
      key: 'category_id',
      render: (_, record: any) => <span>{getCategoryName(record?.goods?.category_id)}</span>,
      renderFormItem: (_, props: any) => <Select {...props}>{renderSearchCategory()}</Select>,
    },
    history?.location?.pathname === '/event/bidding' && {
      title: '活动状态',
      key: 'event_on_line',
      hideInTable: true,
      renderFormItem: (_, props: any) => (
        <Select {...props}>
          <Select.Option value={2}>进行中</Select.Option>
          <Select.Option value={3}>已完成</Select.Option>
        </Select>
      ),
    },
    history?.location?.pathname === '/event/bidding' && {
      title: '起拍价',
      key: 'start_price',
      search: false,
      render: (_, record: any) => <span>{record?.goods?.start_price}</span>,
    },
    // {
    //   title: '最新最高价(JYP)',
    //   key: 'last_price',
    //   width: 120,
    //   search: false,
    //   render: (_, record: any) => <span>{record?.goods?.last_price}</span>,
    // },
    {
      title: '竞拍者',
      key: 'user',
      width: 100,
      // search: false,
      render: (_, record: any) => (
        <span
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setCurrentItem(record);
            setVisibleType('userInfo');
          }}
        >
          {record?.user?.username}
        </span>
      ),
      renderFormItem: (_, props: any) => <AutoCompleteInput {...props} />,
    },
    history?.location?.pathname === '/event/bidding' && {
      title: '最新竞拍价',
      key: 'state',
      width: 120,
      search: false,
      render: (_, record: any) => <span>{`${record?.currency} ${record?.bid}`}</span>,
    },
    history?.location?.pathname === '/event/bidding' && {
      title: '最新出价时间(JST)',
      key: 'update_time',
      width: 150,
      search: false,
      render: (_, record: any) => <span>{record?.update_time}</span>,
    },
    // {
    //   title: '结束时间',
    //   key: 'end_time',
    //   search: false,
    //   render: (_, record: any) => <span>{record?.events?.end_time}</span>
    // },
    history?.location?.pathname === '/event/bidding' && {
      title: '竞拍结果',
      key: 'state',
      width: 80,
      search: false,
      render: (_, record: any) => <span>{record?.bid_result}</span>,
    },
    {
      title: '最终拍卖价(JPY)',
      key: 'finalPrice',
      width: 95,
      search: false,
      render: (_, record: any) => {
        return (
          <>
            {record?.goods?.final_price}&nbsp;
            <Popover
              content={
                <div style={{ width: '230px', overflow: 'hidden' }}>
                  <InputNumber
                    style={{ width: '150px', float: 'left' }}
                    min={0}
                    step={1}
                    precision={0}
                    value={finalPrice}
                    onChange={(value: number) => {
                      setFinalPrice(value);
                    }}
                  />
                  <Button
                    style={{ float: 'right' }}
                    type="primary"
                    onClick={() => {
                      modifyFinalPrice();
                    }}
                  >
                    确认
                  </Button>
                </div>
              }
              title="编辑最终拍卖价(JPY)"
              trigger="hover"
              placement="topRight"
              onVisibleChange={(visible: boolean) => {
                setCurrentItem(visible ? record : null);
                setFinalPrice(visible ? record?.goods?.final_price : 0);
              }}
            >
              <EditOutlined style={{ color: '#1890ff', cursor: 'pointer' }} />
            </Popover>
          </>
        );
      },
    },
    {
      title: '出价历史',
      key: 'history',
      width: 80,
      search: false,
      render: (_, record: any) => [
        <a
          key="history"
          onClick={() => {
            setCurrentItem(record);
            setVisibleType('history');
          }}
        >
          <EyeOutlined /> 查看
        </a>,
      ],
    },
  ];

  const historyColumns = [
    {
      title: '历史竞拍价(JYP)',
      key: 'bid',
      search: false,
      render: (_, record: any) => <span>{record?.bid}</span>,
    },
    {
      title: '竞拍时间(JST)',
      key: 'create_time',
      search: false,
      render: (_, record: any) => <span>{record?.create_time}</span>,
    },
  ];

  const renderModal = () => {
    if (visibleType === 'userInfo') {
      return (
        <Modal
          title="用户信息"
          visible={visibleType}
          destroyOnClose
          onCancel={() => setVisibleType('')}
          footer={null}
        >
          <Descriptions title={null} column={1}>
            <Descriptions.Item label="用户名">{currentItem?.user?.username}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{currentItem?.user?.email}</Descriptions.Item>
            <Descriptions.Item label="手机号">{currentItem?.user?.mobile}</Descriptions.Item>
            <Descriptions.Item label="头像">
              {renderImage(currentItem?.user?.avatar)}
            </Descriptions.Item>
          </Descriptions>
        </Modal>
      );
    }
    return (
      <Modal
        title="出价历史"
        width="30%"
        visible={visibleType}
        destroyOnClose
        onCancel={() => setVisibleType('')}
        footer={null}
      >
        <ProTable
          rowKey="key"
          columns={historyColumns}
          search={false}
          toolBarRender={false}
          request={async (params) => {
            const { current, pageSize } = params;
            const tempParams = {
              page: current,
              size: pageSize,
              user_bid_id: currentItem?.id,
            };
            const res = await getBiddingHistory(tempParams);
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
        />
      </Modal>
    );
  };

  return (
    <PageContainer>
      <ProTable
        actionRef={actionRef}
        rowKey="key"
        columns={columns}
        search={{ labelWidth: 'auto' }}
        manualRequest={history?.location?.pathname === '/event/result'}
        request={async (params) => {
          const { current, pageSize, title, event_id, category_id, event_on_line, user } = params;
          const tempParams = {
            page: current,
            size: pageSize,
            history_flag: history?.location?.pathname === '/event/bidding' ? 0 : 1,
          };
          if (title) {
            tempParams.title = title;
          }
          if (event_id) {
            tempParams.event_id = event_id;
          }
          if (category_id) {
            tempParams.category_id = category_id;
          }
          if (event_on_line) {
            tempParams.event_on_line = event_on_line;
          }
          if (user) {
            tempParams.user_name = user;
          }
          const res = await getEventBidding(tempParams);
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
            setListData(tempItems);
            return {
              data: tempItems,
              total,
              success: true,
            };
          }
          setListData(null);
          return {
            data: [],
            success: false,
            total: 0,
          };
        }}
        pagination={{
          showQuickJumper: true,
        }}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys: selectList,
          onChange: (selectedRowKeys) => {
            checkSelectRow(selectedRowKeys);
          },
        }}
        tableAlertRender={({ selectedRowKeys, _, onCleanSelected }) => {
          return (
            <Space size={16}>
              <span>
                已选 {selectedRowKeys.length} 项{' '}
                <a
                  style={{ marginLeft: 8 }}
                  onClick={() => {
                    onCleanSelected();
                    setSelectList([]);
                  }}
                >
                  取消选择
                </a>
              </span>
            </Space>
          );
        }}
        tableAlertOptionRender={() => {
          return (
            <a
              onClick={() => {
                updataPushState();
              }}
            >
              <SendOutlined /> 发送拍卖结果
            </a>
          );
        }}
      />
      {renderModal()}
    </PageContainer>
  );
};

export default Bidding;

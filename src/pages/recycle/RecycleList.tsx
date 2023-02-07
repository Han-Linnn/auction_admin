import React, { useRef, useState } from 'react';
import { deleteRecycle, getRecycleList, recoverRecycle } from '@/services/api';
import { DeleteOutlined, RedoOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ActionType } from '@ant-design/pro-table';
import { message, Popconfirm } from 'antd';

const handleRecovery = async (params: { operate_type: number; operate_list: string }) => {
  try {
    await recoverRecycle(params);
    message.success('恢复成功');
    return true;
  } catch (error) {
    message.error('恢复失败请重试');
    return false;
  }
};

const handleDelete = async (params: { operate_type: number; operate_list: string }) => {
  try {
    await deleteRecycle(params);
    message.success('删除成功');
    return true;
  } catch (error) {
    message.error('删除失败请重试');
    return false;
  }
};

const RecycleList: React.FC<{}> = () => {
  const actionRef = useRef<ActionType>();
  const [activekey, setActiveKey] = useState<number>(1);

  const onRecover = async (arrId: number[]) => {
    const operate_list = arrId.join(',');
    const success = await handleRecovery({ operate_list, operate_type: activekey });
    if (success) {
      if (actionRef.current) {
        actionRef.current.reload();
      }
    }
  };

  const onDelete = async (arrId: number[]) => {
    const operate_list = arrId.join(',');
    const success = await handleDelete({ operate_list, operate_type: activekey });
    if (success) {
      if (actionRef.current) {
        actionRef.current.reload();
      }
    }
  };

  const columns = [
    {
      title: '名称',
      dataIndex: `${activekey === 1 ? 'title' : 'name'}`,
    },
    {
      title: '开始时间(JST)',
      dataIndex: 'start_time',
    },
    {
      title: '结束时间(JST)',
      dataIndex: 'end_time',
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record: any) => [
        <Popconfirm
          key="delete"
          title="确认恢复?"
          placement="topRight"
          onConfirm={() => {
            onRecover([record.id]);
          }}
        >
          <a>
            <RedoOutlined /> 恢复
          </a>
        </Popconfirm>,
        <Popconfirm
          key="delete"
          title="确认删除?"
          placement="topRight"
          onConfirm={() => {
            onDelete([record.id]);
          }}
        >
          <a>
            <DeleteOutlined /> 删除
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
        search={false}
        request={async (params) => {
          const { current, pageSize } = params;
          const res = await getRecycleList({
            page: current,
            size: pageSize,
            operate_type: activekey,
          });
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
        rowSelection={{}}
        tableAlertOptionRender={false}
        tableAlertRender={({ selectedRowKeys }) => {
          return (
            <div>
              <span>已选 {selectedRowKeys.length} 项</span>
              {selectedRowKeys.length > 1 && (
                <div style={{ float: 'right' }}>
                  <Popconfirm
                    title="确认删除?"
                    placement="topRight"
                    onConfirm={() => {
                      onRecover(selectedRowKeys as number[]);
                    }}
                  >
                    <a style={{ marginRight: '25px' }}>
                      <RedoOutlined />
                      批量恢复
                    </a>
                  </Popconfirm>
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
        toolbar={{
          menu: {
            type: 'tab',
            activeKey: activekey === 1 ? 'goods' : 'events',
            items: [
              {
                key: 'goods',
                tab: '商品',
              },
              {
                key: 'events',
                tab: '活动',
              },
            ],
            onChange: (key) => {
              setActiveKey(key === 'goods' ? 1 : 2);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            },
          },
        }}
        pagination={{
          showQuickJumper: true,
        }}
      />
    </PageContainer>
  );
};

export default RecycleList;

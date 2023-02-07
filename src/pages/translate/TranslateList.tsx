import React, { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ActionType } from '@ant-design/pro-table';
import { Popconfirm, Button, Form, Modal, Input, message } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { getTranslate, createTranslate, modifyTranslate, deleteTranslate, batchDeleteTranslate } from '@/services/api';

const handleModify = async (params: any) => {
  try {
    const response = await modifyTranslate(params);
    if (response.code === 200) {
      message.success('编辑成功');
      return true;
    }
    return false;
  } catch (error) {
    message.error('编辑失败请重试');
    return false;
  }
};

const handleCreate = async (params: any) => {
  try {
    const response = await createTranslate(params);
    if (response.code === 200) {
      message.success('新增成功');
      return true;
    }
    return false;
  } catch (error) {
    message.error('新增失败请重试');
    return false;
  }
};

const handleDelete = async (id: number) => {
  try {
    const response = await deleteTranslate(id);
    if (response.code === 200) {
      message.success('删除成功');
      return true;
    }
    return false;
  } catch (error) {
    message.error('删除失败请重试');
    return false;
  }
};

const handleBatchDelete = async (lstId: []) => {
  try {
    const response = await batchDeleteTranslate({ id_list: lstId });
    if (response.code === 200) {
      message.success('删除成功');
      return true;
    }
    return false;
  } catch (error) {
    message.error('删除失败请重试');
    return false;
  }
};

const TranslateList: React.FC<{}> = () => {
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [visibleType, setVisibleType] = useState<string>('');
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [activekey, setActiveKey] = useState<number>(3);

  const onDelete = async (id: number) => {
    const success = await handleDelete(id);
    if (success) {
      if (actionRef.current) {
        actionRef.current.reload();
      }
    }
  };

  const onBatchDelete = async (lstId: []) => {
    const success = await handleBatchDelete(lstId);
    if (success) {
      if (actionRef.current) {
        actionRef.current.reload();
      }
    }
  };

  const onCancel = () => {
    form.resetFields();
    setCurrentItem(null);
    setVisibleType('');
  };

  const submitForm = async () => {
    const fieldsValue = await form.validateFields();
    const params = {
      source: fieldsValue.source,
      target: fieldsValue.target,
      type: activekey,
    };

    const success = visibleType === 'modify'
      ? await handleModify({ id: currentItem.id, data: params })
      : await handleCreate(params);
    if (success) {
      if (actionRef.current) {
        onCancel();
        actionRef.current.reload();
      }
    }
  };

  const columns = [
    {
      title: '目标词语',
      dataIndex: 'source',
    },
    {
      title: '翻译词语',
      dataIndex: 'target',
    },
    {
      title: '操作',
      valueType: 'option',
      width: 160,
      render: (_, record: any) => [
        <a
          key="editable"
          onClick={() => {
            form.setFieldsValue(record);
            setCurrentItem(record);
            setVisibleType('modify');
          }}
        >
          <EditOutlined /> 编辑
        </a>,
        <Popconfirm
          key="delete"
          title="确认删除?"
          placement="topRight"
          onConfirm={() => {
            onDelete(record.id);
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

  const renderModal = () => {
    const layout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };

    return (
      <Modal
        title={`${visibleType === 'modify' ? "编辑" : '新增'}${activekey === 4 ? '日英翻译' : '中英翻译'}`}
        visible={visibleType}
        destroyOnClose
        onCancel={() => {
          onCancel();
        }}
        onOk={() => {
          submitForm();
        }}
      >
        <Form {...layout} form={form}>
          <Form.Item
            label="目标词语"
            name="source"
            rules={[{ required: true, message: '请输入目标词语' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="翻译词语"
            name="target"
            rules={[{ required: true, message: '请输入翻译词语' }]}
          >
            <Input />
          </Form.Item>
        </Form>
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
        request={async (params) => {
          const { current, pageSize, source, target } = params;
          const tempParams = {
            page: current,
            size: pageSize,
            type: activekey
          };
          if (source) {
            tempParams.source = source;
          }
          if (target) {
            tempParams.target = target;
          }
          const res = await getTranslate(tempParams);
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
        toolbar={{
          menu: {
            type: 'tab',
            activeKey: activekey === 4 ? 'Japanese' : 'chinese',
            items: [
              {
                key: 'chinese',
                tab: '英转中',
              },
              {
                key: 'Japanese',
                tab: '英转日',
              },
            ],
            onChange: (key) => {
              setActiveKey(key === 'Japanese' ? 4 : 3)
              if (actionRef.current) {
                actionRef.current.reload();
              }
            },
          },
          actions: [
            <Button key="add" type="primary" onClick={() => {
              setVisibleType('create');
            }}>
              {`新增${activekey === 4 ? '日英翻译' : '中英翻译'}`}
            </Button>,
          ],
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
                  <Popconfirm
                    title="确认删除?"
                    placement="topRight"
                    onConfirm={() => {
                      onBatchDelete(selectedRowKeys);
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
          )
        }}
      />
      {renderModal()}
    </PageContainer>
  )
}

export default TranslateList

import React, { useRef, useState } from 'react';
import { history } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ActionType } from '@ant-design/pro-table';
import { Popconfirm, Button, Form, Modal, Input, message, Tag } from 'antd';
import {
  EditOutlined,
  PlusOutlined,
  TrademarkOutlined,
  UnorderedListOutlined,
  DeleteOutlined,
  PlusSquareOutlined,
  MinusSquareOutlined,
} from '@ant-design/icons';
import 'antd/dist/antd.css';
import { getGoodsCate, modifyCategory, createCategory, deleteCategory } from '@/services/api';

const handleModify = async (params: {
  id: number;
  category_name: string;
  show_seq: number;
  parent_id: number;
  level: number;
}) => {
  try {
    const response = await modifyCategory(params);
    if (response.code === 201) {
      message.success('编辑成功');
      return true;
    }
    return false;
  } catch (error) {
    message.error('编辑失败请重试');
    return false;
  }
};

const handleCreate = async (params: {
  category_name: string;
  show_seq: number;
  parent_id: number;
  level: number;
}) => {
  try {
    const response = await createCategory(params);
    if (response.code === 201) {
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
    const response = await deleteCategory(id);
    if (response.code === 202) {
      message.success('删除成功');
      return true;
    }
    return false;
  } catch (error) {
    message.error('删除失败请重试');
    return false;
  }
};

const CategoryList: React.FC<{}> = () => {
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [visibleType, setVisibleType] = useState<string>('');
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [dataTotal, setDataTotal] = useState<number>(0);
  const tagColor = ['green', 'blue', 'purple', 'gold', 'geekblue'];

  const setRowKey = (data: any) => {
    return data.map((item: any) => {
      if ('children' in item && item.children && item.children.length > 0) {
        return {
          key: item?.id,
          ...item,
          children: setRowKey(item.children),
        };
      }
      return {
        key: item?.id,
        ...item,
      };
    });
  };

  const onDelete = async (id: number) => {
    const success = await handleDelete(id);
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
    const params = { category_name: fieldsValue.category_name };
    if (visibleType !== 'modify') {
      if (visibleType === 'sub') {
        params.id = currentItem.id;
      }
      params.show_seq = visibleType === 'sub' ? currentItem?.children.length + 1 : dataTotal + 1;
      params.parent_id = visibleType === 'sub' ? currentItem.id : 0;
      params.level = visibleType === 'sub' ? currentItem.level + 1 : 1;
    } else {
      params.id = currentItem.id;
      params.show_seq = currentItem.show_seq;
      params.parent_id = currentItem.parent_id;
      params.level = currentItem.level;
    }

    const success =
      visibleType === 'modify' ? await handleModify(params) : await handleCreate(params);
    if (success) {
      if (actionRef.current) {
        onCancel();
        actionRef.current.reload();
      }
    }
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'category_name',
    },
    {
      title: '层级',
      dataIndex: 'level',
      render: (_, record: any) => {
        const index = record.level - 1;
        return <Tag color={index > tagColor.length ? 'cyan' : tagColor[index]}>{record.level}</Tag>;
      },
    },
    {
      title: '上次修改时间(JST)',
      dataIndex: 'update_time',
    },
    {
      title: '操作',
      valueType: 'option',
      width: 340,
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
        <a
          key="editable"
          onClick={() => {
            setCurrentItem(record);
            setVisibleType('sub');
          }}
        >
          <PlusOutlined /> 新增子类
        </a>,
        <a
          key="editable"
          onClick={() => {
            history.push({
              pathname: '/category/brand',
              query: {
                cateId: record.id,
                cateName: record.category_name,
              },
            });
          }}
        >
          <TrademarkOutlined /> 品牌
        </a>,
        <a
          key="editable"
          onClick={() => {
            history.push({
              pathname: '/category/specification',
              query: {
                cateId: record.id,
                cateName: record.category_name,
              },
            });
          }}
        >
          <UnorderedListOutlined /> 规格
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
        title={`${visibleType === 'modify' ? '编辑' : '新增'}分类`}
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
            label="分类名称"
            name="category_name"
            rules={[{ required: true, message: '请输入分类名称' }]}
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
        search={false}
        request={async (params) => {
          const { current, pageSize } = params;
          const res = await getGoodsCate({
            page: current,
            size: pageSize,
          });
          const { code } = res;
          if (code === 200) {
            const {
              data: { items, total },
            } = res;
            setDataTotal(total);
            return {
              data: setRowKey(items),
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
        expandable={{
          indentSize: 40,
          expandIcon: ({ expanded, onExpand, record }) => {
            if ('children' in record && record.children && record.children.length > 0) {
              return (
                <Button
                  style={{ border: 0 }}
                  icon={expanded ? <MinusSquareOutlined /> : <PlusSquareOutlined />}
                  onClick={(e) => onExpand(record, e)}
                />
              );
            }
            return <Button />;
          },
        }}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            onClick={() => {
              setVisibleType('create');
            }}
          >
            新增分类
          </Button>,
        ]}
        pagination={{
          showQuickJumper: true,
        }}
      />
      {renderModal()}
    </PageContainer>
  );
};

export default CategoryList;

import React, { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ActionType } from '@ant-design/pro-table';
import { Popconfirm, Button, Form, Modal, Input, message } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { getAttribute, createAttribute, modifyAttribute, deleteAttribute } from '@/services/api';

const AttributeList: React.FC<{ props: any }> = (props) => {
  const {
    location: {
      query: { sp_id, cateName, spName },
    },
  } = props;
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [visibleType, setVisibleType] = useState<string>('');
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [dataTotal, setDataTotal] = useState<number>(0);

  const onCreate = async (params: any) => {
    const response = await createAttribute(params);
    if (response.code === 201) {
      message.success('新增成功');
      return true;
    }
    return false;
  }

  const onModify = async (params: any) => {
    const response = await modifyAttribute(params);
    if (response.code === 201) {
      message.success('修改成功');
      return true;
    }
    return false;
  }

  const onDelete = async (id: number) => {
    const response = await deleteAttribute(id);
    if (response.code === 202) {
      message.success('删除成功');
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
    let params = {};
    if (visibleType === 'modify') {
      params = {
        id: currentItem.id,
        data: {
          name: fieldsValue.name,
          sp_id,
          show_seq: currentItem.show_seq,
          description: fieldsValue.description,
        }
      };
    } else {
      params = {
        name: fieldsValue.name,
        sp_id,
        show_seq: (dataTotal + 1),
        description: fieldsValue.description,
      };
    }

    const success = visibleType === 'modify' ? await onModify(params) : await onCreate(params);
    if (success) {
      if (actionRef.current) {
        onCancel();
        actionRef.current.reload();
      }
    }
  };

  const columns = [
    {
      title: '属性名称',
      dataIndex: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 140,
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
        title={`${visibleType === 'modify' ? "编辑" : '新增'}属性`}
        visible={visibleType}
        destroyOnClose
        onCancel={() => {
          onCancel()
        }}
        onOk={() => {
          submitForm();
        }}
      >
        <Form {...layout} form={form}>
          <Form.Item
            label="属性名称"
            name="name"
            rules={[{ required: true, message: '请输入属性名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="描述"
            name="description"
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  return (
    <PageContainer title={`${cateName}-${spName}-属性列表`}>
      <ProTable
        actionRef={actionRef}
        rowKey="key"
        columns={columns}
        search={{ labelWidth: 'auto' }}
        request={async (params) => {
          const { current, pageSize, name } = params;
          const tempParams = {
            sp_id,
            page: current,
            size: pageSize,
          }
          if (name) {
            tempParams.name = name
          }
          const res = await getAttribute(tempParams);
          const { code } = res;
          if (code === 200) {
            const {
              data: { items, total },
            } = res;
            setDataTotal(total);
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
        toolBarRender={() => [
          <Button
            key='add'
            type="primary"
            onClick={() => {
              setVisibleType('create');
            }}
          >
            新增属性
          </Button>,
        ]}
        pagination={{
          showQuickJumper: true,
        }}
      />
      {renderModal()}
    </PageContainer>
  )
}

export default AttributeList

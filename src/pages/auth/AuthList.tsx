import React, { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ActionType } from '@ant-design/pro-table';
import { Popconfirm, Button, Form, Modal, Input, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getPermission, createPermission, modifyPermission, deletePermission } from '@/services/api';

const AuthList: React.FC<{}> = () => {
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [visibleType, setVisibleType] = useState<string>('');
  const [currentItem, setCurrentItem] = useState<any>(null);

  const onCreate = async (params: any) => {
    const response = await createPermission(params);
    if (response.code === 201) {
      message.success('新增成功');
      return true;
    }
    return false;
  }

  const onModify = async (params: any) => {
    const response = await modifyPermission(params);
    if (response.code === 201) {
      message.success('编辑成功');
      return true;
    }
    return false;
  }

  const onDelete = async (id: number) => {
    const response = await deletePermission(id);
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
    const params = {
      name: fieldsValue.name,
      label: fieldsValue.label,
    };
    const success = visibleType === 'modify'
      ? await onModify({ id: currentItem.id, data: params })
      : await onCreate(params);
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
      dataIndex: 'name',
    },
    {
      title: '描述',
      dataIndex: 'label',
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
        </Popconfirm>
      ]
    },
  ];

  const renderModal = () => {
    const layout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };

    return (
      <Modal
        title='新建权限'
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
            label="权限名称"
            name="name"
            rules={[{ required: true, message: '请输入权限名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="权限描述"
            name="label"
          >
            <Input.TextArea rows={4} />
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
          const res = await getPermission({
            page: current,
            size: pageSize,
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
            total: 0
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
            新建权限
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

export default AuthList

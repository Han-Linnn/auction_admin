import React, { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ActionType } from '@ant-design/pro-table';
import { Popconfirm, Button, Form, Modal, Input, message, Spin } from 'antd';
import { LockOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getRole, createRole, modifyRole, deleteRole, getRoleDetail } from '@/services/api';
import PermissionModal from './components/PermissionModal';

const RoleList: React.FC<{}> = () => {
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [visibleType, setVisibleType] = useState<string>('');
  const [currentItem, setCurrentItem] = useState<any>(null);

  const [roleData, setRoleData] = useState(null);
  const [spinning, setSpinning] = useState(false);

  const onCreate = async (params: any) => {
    const response = await createRole(params);
    if (response.code === 201) {
      message.success('新增成功');
      return true;
    }
    return false;
  };

  const onModify = async (params: any) => {
    const response = await modifyRole(params);
    if (response.code === 201) {
      message.success('编辑成功');
      return true;
    }
    return false;
  };

  const onDelete = async (id: number) => {
    const response = await deleteRole(id);
    if (response.code === 202) {
      message.success('删除成功');
      if (actionRef.current) {
        actionRef.current.reload();
      }
    }
  };

  const getDetail = async (id: number) => {
    setSpinning(true);
    const response = await getRoleDetail(id);
    if (response.code === 200) {
      if ('data' in response) {
        setRoleData(response.data);
        setSpinning(false);
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
    const success =
      visibleType === 'modify'
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
      title: '上次修改时间(JST)',
      dataIndex: 'update_time',
    },
    {
      title: '操作',
      valueType: 'option',
      // width: 210,
      render: (_, record: any) => [
        <a
          key="auth"
          onClick={() => {
            getDetail(record.id);
          }}
        >
          <LockOutlined /> 权限管理
        </a>,
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
        title="新建角色"
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
            label="角色名称"
            name="name"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="角色描述" name="label">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  return (
    <PageContainer>
      <Spin spinning={spinning}>
        <ProTable
          actionRef={actionRef}
          rowKey="key"
          columns={columns}
          search={false}
          request={async (params) => {
            const { current, pageSize } = params;
            const res = await getRole({
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
              total: 0,
            };
          }}
          toolBarRender={() => [
            <Button
              key="add"
              type="primary"
              onClick={() => {
                setVisibleType('create');
              }}
            >
              新建角色
            </Button>,
          ]}
          expandable={{
            expandIconColumnIndex: -1,
          }}
          pagination={{
            showQuickJumper: true,
          }}
        />
        {renderModal()}
        <PermissionModal
          roleData={roleData}
          pModalCancel={() => {
            setRoleData(null);
          }}
        />
      </Spin>
    </PageContainer>
  );
};

export default RoleList;

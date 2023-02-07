import React, { useRef, useState } from 'react';
import { history } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ActionType } from '@ant-design/pro-table';
import { Popconfirm, Button, Form, Modal, Input, message } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  UnorderedListOutlined
} from '@ant-design/icons';
import { getSpecification, createSpecification, modifySpecification, deleteSpecification } from '@/services/api';

const SpecificationList: React.FC<{ props: any }> = (props) => {
  const {
    location: {
      query: { cateId, cateName },
    },
  } = props;
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [visibleType, setVisibleType] = useState<string>('');
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [dataTotal, setDataTotal] = useState<number>(0);
  const [sp_type, setSp_type] = useState<number>(0);

  const onCreate = async (params: any) => {
    const response = await createSpecification(params);
    if (response.code === 201) {
      message.success('新增成功');
      return true;
    }
    return false;
  }

  const onModify = async (params: any) => {
    const response = await modifySpecification(params);
    if (response.code === 201) {
      message.success('修改成功');
      return true;
    }
    return false;
  }

  const onDelete = async (id: number) => {
    const response = await deleteSpecification(id);
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
      category_id: Number(cateId),
      name: fieldsValue.name,
      show_seq: visibleType === 'modify' ? currentItem.show_seq : (dataTotal + 1),
      sp_type,
      description: fieldsValue.description,
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
      title: '规格名称',
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
      width: 220,
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
            history.push({
              pathname: '/category/attributeList',
              query: {
                sp_id: record.id,
                cateName,
                spName: record.name
              },
            });
          }}
        >
          <UnorderedListOutlined /> 查看属性
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
        title={`${visibleType === 'modify' ? "编辑" : '新增'}规格`}
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
            label="规格名称"
            name="name"
            rules={[{ required: true, message: '请输入规格名称' }]}
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
    <PageContainer title={`${cateName}-规格列表`}>
      <ProTable
        actionRef={actionRef}
        rowKey="key"
        columns={columns}
        search={{ labelWidth: 'auto' }}
        request={async (params) => {
          const { current, pageSize, name } = params;
          const tempParams = {
            category_id: cateId,
            sp_type,
            page: current,
            size: pageSize,
          }
          if (name) {
            tempParams.name = name
          }
          const res = await getSpecification(tempParams);
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
        toolbar={{
          menu: {
            type: 'tab',
            activeKey: `${sp_type}`,
            items: [
              {
                key: '0',
                tab: '规格信息',
              },
              // {
              //   key: '1',
              //   tab: '商品参数',
              // },
            ],
            onChange: (key) => {
              setSp_type(Number(key))
              if (actionRef.current) {
                actionRef.current.reload();
              }
            },
          },
          actions: [
            <Button key="add" type="primary" onClick={() => {
              setVisibleType('create');
            }}>
              {`新增${sp_type ? '商品参数' : '规格信息'}`}
            </Button>,
          ],
        }}
        pagination={{
          showQuickJumper: true,
        }}
      />
      {renderModal()}
    </PageContainer>
  )
}

export default SpecificationList

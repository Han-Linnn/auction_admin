import React, { useRef, useState } from 'react';
import { history } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ActionType } from '@ant-design/pro-table';
import { Popconfirm, Button, Form, Modal, Input, message } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  TrademarkOutlined
} from '@ant-design/icons';
import { getBrand, createBrand, modifyBrand, deleteBrand } from '@/services/api';

const BrandList: React.FC<{ props: any }> = (props) => {
  const {
    location: {
      query: { cateId, cateName },
    },
  } = props;
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [visibleType, setVisibleType] = useState<string>('');
  const [currentItem, setCurrentItem] = useState<any>(null);

  const onCreate = async (params: any) => {
    const response = await createBrand(params);
    if (response.code === 200) {
      message.success('新增成功');
      return true;
    }
    return false;
  }

  const onModify = async (params: any) => {
    const response = await modifyBrand(params);
    if (response.code === 200) {
      message.success('修改成功');
      return true;
    }
    return false;
  }

  const onDelete = async (id: number) => {
    const response = await deleteBrand(id);
    if (response.code === 200) {
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
        brandId: currentItem.id,
        data: {
          name: fieldsValue.name,
          cate_id: cateId
        }
      };
    } else {
      params = {
        cateId,
        data: {
          name: fieldsValue.name,
        }
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
      title: '品牌名称',
      dataIndex: 'name',
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
              pathname: '/category/series',
              query: {
                brandId: record.id,
                cateName,
                brandName: record.name
              },
            });
          }}
        >
          <TrademarkOutlined /> 查看系列
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
        title={`${visibleType === 'modify' ? "编辑" : '新增'}品牌`}
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
            label="品牌名称"
            name="name"
            rules={[{ required: true, message: '请输入品牌名称' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  return (
    <PageContainer title={`${cateName}-品牌列表`}>
      <ProTable
        actionRef={actionRef}
        rowKey="key"
        columns={columns}
        search={false}
        request={async (params) => {
          const { current, pageSize } = params;
          const res = await getBrand({
            cateId,
            data: {
              page: current,
              size: pageSize,
            }
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
            key='add'
            type="primary"
            onClick={() => {
              setVisibleType('create');
            }}
          >
            新增品牌
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

export default BrandList

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
import { getSeries, createSeries, modifySeries, deleteSeries } from '@/services/api';

const SeriesList: React.FC<{ props: any }> = (props) => {
  const {
    location: {
      query: { brandId, cateName, brandName },
    },
  } = props;
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [visibleType, setVisibleType] = useState<string>('');
  const [currentItem, setCurrentItem] = useState<any>(null);

  const onCreate = async (params: any) => {
    const response = await createSeries(params);
    if (response.code === 200) {
      message.success('新增成功');
      return true;
    }
    return false;
  }

  const onModify = async (params: any) => {
    const response = await modifySeries(params);
    if (response.code === 200) {
      message.success('修改成功');
      return true;
    }
    return false;
  }

  const onDelete = async (id: number) => {
    const response = await deleteSeries(id);
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
        seriesId: currentItem.id,
        data: {
          name: fieldsValue.name,
        }
      };
    } else {
      params = {
        brandId,
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
      title: '系列名称',
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
        title={`${visibleType === 'modify' ? "编辑" : '新增'}系列`}
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
            label="系列名称"
            name="name"
            rules={[{ required: true, message: '请输入系列名称' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  return (
    <PageContainer title={`${cateName}-${brandName}-系列列表`}>
      <ProTable
        actionRef={actionRef}
        rowKey="key"
        columns={columns}
        search={false}
        request={async (params) => {
          const { current, pageSize } = params;
          const res = await getSeries({
            brandId,
            data: {
              page: current,
              size: pageSize,
            }
          });
          const { code } = res;
          if (code === 200) {
            const { data } = res;
            const tempData = data.map((item: any) => {
              const { id } = item;
              const key = id;
              return {
                ...item,
                key
              };
            });
            return {
              data: tempData,
              success: true,
            };
          }
          return {
            data: [],
            success: false,
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
            新增系列
          </Button>,
        ]}
        pagination={false}
      />
      {renderModal()}
    </PageContainer>
  )
}

export default SeriesList

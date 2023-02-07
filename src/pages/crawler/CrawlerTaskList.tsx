import React, { useEffect, useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProTable, { ActionType } from '@ant-design/pro-table';
import { Popconfirm, Button, Form, Modal, Input, Select, Radio, DatePicker, message } from 'antd';
import { PauseCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  getCrawler,
  getCrawlerTask,
  createCrawlerTask,
  deleteCrawlerTask,
  cancelCrawlerTask,
} from '@/services/api';

const CrawlerTaskList: React.FC<{}> = () => {
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [crawlerListData, setCrawlerListData] = useState(null);
  const [visible, setVisible] = useState(false);
  const [isdelay, setIsdelay] = useState(1); // 0:true; 1:false
  const statusTitle = {
    finished: '已完成',
    running: '运行中',
    canceled: '已取消',
    error: '任务出错',
    pending: '等待中',
    abnormal: '宕机',
  };

  const getCrawlerListData = async () => {
    const response = await getCrawler({ page: 1, size: 99 });
    if (response.code === 200) {
      setCrawlerListData(response?.data?.items);
    }
  };

  useEffect(() => {
    getCrawlerListData();
  }, []);

  const getCrawlerName = (id: number) => {
    let tempName = '';
    if (crawlerListData && crawlerListData.length > 0) {
      crawlerListData.forEach((item: any) => {
        if (item.id === id) {
          tempName = item.name;
        }
      });
    }
    return tempName;
  };

  const onModify = async (params: any) => {
    const response = await cancelCrawlerTask(params);
    if (response.code === 200) {
      message.success('取消成功');
      if (actionRef.current) {
        actionRef.current.reload();
      }
    }
  };

  const onDelete = async (id: number) => {
    const response = await deleteCrawlerTask(id);
    if (response.code === 200) {
      message.success('删除成功');
      if (actionRef.current) {
        actionRef.current.reload();
      }
    }
  };

  const onCancel = () => {
    form.resetFields();
    setIsdelay(1);
    setVisible(false);
  };

  const submitForm = async () => {
    const fieldsValue = await form.validateFields();
    const params = {
      name: fieldsValue.name,
      crawler_id: fieldsValue.crawler_id,
      type: fieldsValue.type,
    };
    if (fieldsValue.type === 0) {
      params.start_time = fieldsValue.start_time.format('YYYY-MM-DD HH');
    }

    const response = await createCrawlerTask(params);
    if (response.code === 200) {
      message.success('新增成功');
      if (actionRef.current) {
        onCancel();
        actionRef.current.reload();
      }
    }
  };

  const renderCrawlerSelect = () => {
    if (crawlerListData && crawlerListData.length > 0) {
      return crawlerListData.map((item: any) => (
        <Select.Option key={item.id} value={item.id}>
          {' '}
          {item.name}
        </Select.Option>
      ));
    }
    return null;
  };

  const columns = [
    {
      title: '任务名称',
      dataIndex: 'name',
    },
    {
      title: '爬虫名称',
      key: 'crawler_id',
      render: (_, record: any) => <span>{getCrawlerName(record.crawler_id)}</span>,
    },
    {
      title: '启动时间(JST)',
      dataIndex: 'start_time',
    },
    {
      title: '状态',
      key: 'status',
      render: (_, record: any) => (
        <span>{record.status in statusTitle ? statusTitle[record.status] : record.status}</span>
      ),
    },
    {
      title: '操作',
      valueType: 'option',
      width: 60,
      render: (_, record: any) => (
        <>
          {(record.status === 'pending' || record.status === 'running') && (
            <Popconfirm
              key="delete"
              title="确认取消?"
              placement="topRight"
              onConfirm={() => {
                onModify(record.id);
              }}
            >
              <a>
                <PauseCircleOutlined />
                取消
              </a>
            </Popconfirm>
          )}
          {record.status !== 'pending' && record.status !== 'running' && (
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
          )}
        </>
      ),
    },
  ];

  const renderModal = () => {
    const layout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };

    return (
      <Modal
        title="新建任务"
        visible={visible}
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
            label="任务名称"
            name="name"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="使用爬虫"
            name="crawler_id"
            rules={[{ required: true, message: '请选择使用爬虫' }]}
          >
            <Select>{renderCrawlerSelect()}</Select>
          </Form.Item>
          <Form.Item
            label="任务类型"
            name="type"
            rules={[{ required: true, message: '请选择任务类型' }]}
          >
            <Radio.Group
              onChange={(e) => {
                setIsdelay(e.target.value);
              }}
            >
              <Radio value={0}>延后启动</Radio>
              <Radio value={1}>马上启动</Radio>
            </Radio.Group>
          </Form.Item>
          {isdelay === 0 && (
            <Form.Item
              label="启动时间(JST)"
              name="start_time"
              rules={[{ required: isdelay === 0, message: '请选择启动时间' }]}
            >
              <DatePicker showTime={{ format: 'HH' }} format="YYYY-MM-DD HH" />
            </Form.Item>
          )}
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
          const res = await getCrawlerTask({
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
              form.setFieldsValue({ type: isdelay });
              setVisible(true);
            }}
          >
            新建任务
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

export default CrawlerTaskList;

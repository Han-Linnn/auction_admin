import React, { useRef, useState } from 'react';
import { history } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import moment from 'moment';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import {
  Popconfirm,
  Button,
  Form,
  Modal,
  Input,
  DatePicker,
  message,
  Image,
  Spin,
  Upload,
  Select,
  Tag,
  Switch,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CloseSquareOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import { getEventList, createEvent, modifyEvent, deleteEvent } from '@/services/api';
import { apiURL, imageFallback, uploadURL } from '@/utils/constants';
import { localGet } from '@/utils/store';

const EventList: React.FC<{}> = () => {
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [visible, setVisible] = useState<boolean>(false);
  const [imagesList, setImagesList] = useState<any[]>([]); // 活动封面图片
  const [delImagesList, setDelImagesList] = useState<string[]>([]); // 删除活动封面图

  const onCreate = async (params: any) => {
    const response = await createEvent(params);
    if (response.code === 201) {
      message.success('新增成功');
      if (actionRef.current) {
        form.resetFields();
        setVisible(false);
        actionRef.current.reload();
      }
    }
  };

  const onModifyStatus = async (rowData: any, option: any) => {
    const params = {
      id: rowData.id,
      data: {
        name: rowData.name,
        start_time: rowData.start_time,
        end_time: rowData.end_time,
        ...option,
      },
    };
    const response = await modifyEvent(params);
    if (response.code === 201) {
      message.success('编辑成功');
      if (actionRef.current) {
        actionRef.current.reload();
      }
    }
  };

  const onDelete = async (id: number) => {
    const response = await deleteEvent(id);
    if (response.code === 202) {
      message.success('删除成功');
      if (actionRef.current) {
        actionRef.current.reload();
      }
    }
  };

  const exportEvent = async (event: any, id: number, name: string) => {
    event.preventDefault();
    event.stopPropagation();
    fetch(`${apiURL}/user_bid/export?event_id=${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: new Headers({
        Authorization: `Bearer ${localGet('auctionAdminToken')}`,
      }),
    })
      .then((response) => {
        response.blob().then((blob) => {
          const blobUrl = window.URL.createObjectURL(blob);
          const filename = `${name}.xlsx`;
          const aElement = document.createElement('a');
          document.body.appendChild(aElement);
          aElement.style.display = 'none';
          aElement.href = blobUrl;
          aElement.download = filename;
          aElement.click();
          window.URL.revokeObjectURL(blobUrl);
          document.body.removeChild(aElement);
        });
      })
      .catch((error) => {
        message.warning('导出失败');
        console.log('导出失败', error);
      });
  };

  const splitImageUrl = (url: string) => {
    const tempUrl = url.split('/');
    if (tempUrl.length > 0) {
      tempUrl.splice(0, 3);
      return `/${tempUrl.join('/')}`;
    }
    return url;
  };

  const submitForm = async () => {
    const tempData: API.EventData = {};
    const fieldsValue = await form.validateFields();
    tempData.name = fieldsValue.name;
    tempData.start_time = fieldsValue.start_time.format('YYYY-MM-DD HH:mm:ss');
    tempData.end_time = fieldsValue.end_time.format('YYYY-MM-DD HH:mm:ss');
    tempData.extend = fieldsValue.extend;
    // 封面图
    if (imagesList.length > 0) {
      const tempPicUrl: string[] = [];
      const tempPicSmallUrl: string[] = [];
      imagesList.forEach((item) => {
        tempPicUrl.push(splitImageUrl(item.url));
        tempPicSmallUrl.push(splitImageUrl(item.smallUrl));
      });
      tempData.pic_url = tempPicUrl;
      tempData.pic_small_url = tempPicSmallUrl;
    }
    console.log(tempData);
    await onCreate(tempData);
  };

  const renderImage = (id: number, data: any) => {
    if (data && data.length > 0) {
      return (
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => {
            history.push({
              pathname: '/event/modify',
              query: { id },
            });
          }}
        >
          <Image
            width={50}
            height={50}
            src={data[0]}
            preview={false}
            fallback={imageFallback}
            placeholder={<Spin />}
          />
        </div>
      );
    }
    return <img src={imageFallback} alt="img" style={{ width: 50, height: 50 }} />;
  };

  const renderStatus = (online: number) => {
    const lstName = ['待上线', '即将开始', '进行中', '已完成'];
    const lstColor = ['grey', 'magenta', 'blue', 'green'];
    if (lstName.length - 1 >= online) {
      return <Tag color={lstColor[online]}>{lstName[online]}</Tag>;
    }
    return '-';
  };

  const renderShow = (data: any) => {
    return (
      <Switch
        checkedChildren="√"
        unCheckedChildren="x"
        checked={data?.show_price}
        onChange={(state) => {
          onModifyStatus(data, { show_price: state });
        }}
      />
    );
  };

  const columns = [
    {
      title: '封面图',
      dataIndex: 'pic_url',
      render: (_, record: any) => renderImage(record.id, record.pic_small_url),
      search: false,
    },
    {
      title: '名称',
      dataIndex: 'name',
      render: (_, record: any) => (
        <span
          style={{ cursor: 'pointer' }}
          onClick={() => {
            history.push({
              pathname: '/event/modify',
              query: { id: record.id },
            });
          }}
        >
          {record.name}
        </span>
      ),
    },
    {
      title: '举办方',
      dataIndex: 'source',
      search: false,
    },
    {
      title: '开始时间',
      dataIndex: 'start_time',
      search: false,
    },
    {
      title: '结束时间',
      dataIndex: 'end_time',
      search: false,
    },
    {
      title: '备注',
      dataIndex: 'extend',
      search: false,
    },
    {
      title: '热卖',
      dataIndex: 'is_hot',
      render: (_, record: any) => <span>{record.is_hot ? '是' : '否'}</span>,
      search: false,
    },
    {
      title: '活动状态',
      key: 'status',
      render: (_, record: any) => <span>{renderStatus(record?.on_line)}</span>,
      renderFormItem: (_, props: any) => (
        <Select {...props}>
          <Select.Option value={0}>待上线</Select.Option>
          <Select.Option value={1}>即将开始</Select.Option>
          <Select.Option value={2}>进行中</Select.Option>
          <Select.Option value={3}>已完成</Select.Option>
        </Select>
      ),
    },
    {
      title: '显示起拍价',
      key: 'show_price',
      render: (_, record: any) => renderShow(record),
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 180,
      render: (_, record: any) => (
        <>
          <a
            key="editable"
            onClick={() => {
              history.push({
                pathname: '/event/modify',
                query: { id: record.id },
              });
            }}
          >
            <EditOutlined /> 查看 / 编辑
          </a>
          <Popconfirm
            key="delete"
            title="确认删除?"
            placement="topRight"
            onConfirm={() => {
              onDelete(record.id);
            }}
          >
            <a style={{ marginLeft: '12px' }}>
              <DeleteOutlined />
              删除
            </a>
          </Popconfirm>
          {record.on_line !== 0 && record.on_line !== 3 && (
            <Popconfirm
              key="end"
              title="确认结束活动?"
              placement="topRight"
              onConfirm={() => {
                onModifyStatus(record, { on_line: 3 });
              }}
            >
              <a style={{ marginLeft: '12px' }}>
                <CloseSquareOutlined />
                快捷结束
              </a>
            </Popconfirm>
          )}
          <a
            key="export"
            style={{ marginLeft: '12px' }}
            onClick={(event: any) => {
              exportEvent(event, record.id, record.name);
            }}
          >
            <ExportOutlined /> 导出
          </a>
        </>
      ),
    },
  ];

  const uploadChange = (info: any) => {
    setImagesList(info.fileList);
    if (info.file.status === 'done') {
      const { response } = info.file;
      if (response.code === 200) {
        if ('data' in response) {
          const { data } = response;
          // const temp = [...imagesList];
          const temp = [];
          temp.push({
            uid: imagesList.length,
            url: 'pic_url' in data ? data.pic_url[0] : '',
            smallUrl: 'pic_small_url' in data ? data.pic_small_url[0] : '',
          });
          setImagesList(temp);
        }
      }
    }
  };

  const renderModal = () => {
    const layout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    const uploadButton = (
      <div style={{ width: '100px', height: '100px', display: 'grid', placeItems: 'center' }}>
        <PlusOutlined />
        上传图片
      </div>
    );

    return (
      <Modal
        title="新增活动"
        visible={visible}
        destroyOnClose
        onCancel={() => {
          form.resetFields();
          setImagesList([]);
          setVisible(false);
        }}
        onOk={() => {
          submitForm();
        }}
      >
        <Form {...layout} form={form}>
          <Form.Item
            label="活动名称"
            name="name"
            rules={[{ required: true, message: '请输入活动名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="开始时间"
            name="start_time"
            rules={[{ required: true, message: '请输入开始时间' }]}
          >
            <DatePicker
              showTime
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < moment().startOf('day')}
            />
          </Form.Item>
          <Form.Item
            label="结束时间"
            name="end_time"
            rules={[{ required: true, message: '请输入结束时间' }]}
          >
            <DatePicker
              showTime
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < moment().startOf('day')}
            />
          </Form.Item>
          <Form.Item label="备注" name="extend">
            <Input />
          </Form.Item>
          <Form.Item label="封面" name="cover">
            <Upload
              accept=".png, .jpg, .jpeg"
              action={uploadURL}
              listType="picture-card"
              fileList={imagesList}
              onChange={uploadChange}
              headers={{
                authorization: `Bearer ${localGet('auctionAdminToken')}`,
              }}
              data={{
                module_name: 'event',
              }}
              onPreview={(file) => {
                window.open(file.url, '_blank');
              }}
              onRemove={(file) => {
                const temp = [...imagesList];
                temp.splice(file.uid, 1);
                setImagesList(temp);
                const tempDel = [...delImagesList];
                tempDel.push(file.url);
                setDelImagesList(tempDel);
              }}
            >
              {imagesList.length >= 1 ? null : uploadButton}
            </Upload>
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
          const { current, pageSize, status, name, is_hot } = params;
          const tempParams = {
            page: current,
            size: pageSize,
          };
          if (name) {
            tempParams.name = name;
          }
          if (status) {
            tempParams.status = status;
          }
          if (is_hot) {
            tempParams.is_hot = is_hot;
          }
          const res = await getEventList(tempParams);
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
              setVisible(true);
            }}
          >
            新增活动
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

export default EventList;

import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { PageContainer } from '@ant-design/pro-layout';
import { deleteImage, getEventDetail, modifyEvent } from '@/services/api';
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Card,
  Select,
  DatePicker,
  message,
  Upload,
  Switch,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { uploadURL } from '@/utils/constants';
import { localGet } from '@/utils/store';
import EventGoods from './components/EventGoods';
import styles from '../goods/detail.less';

const EventModify: React.FC<{ props: any }> = (props) => {
  const {
    location: {
      query: { id },
    },
  } = props;
  const [form] = Form.useForm();
  const [detailData, setDetailData] = useState<any>(null);
  const [imagesList, setImagesList] = useState<any[]>([]); // 活动封面图片
  const [delImagesList, setDelImagesList] = useState<string[]>([]); // 删除活动封面图

  const initImagesList = (data: any) => {
    if (
      data &&
      'pic_small_url' in data &&
      data.pic_small_url &&
      'pic_url' in data &&
      data.pic_url
    ) {
      const { pic_small_url } = data;
      const tempData = [];
      pic_small_url.forEach((item: string, index: number) => {
        tempData.push({
          uid: index,
          url: data.pic_url[0],
          smallUrl: item,
        });
      });
      setImagesList(tempData);
    }
  };

  const getDetailData = async () => {
    const response = await getEventDetail({ id });
    let tempData = null;
    if (response.code === 200) {
      const { data } = response;
      tempData = data;
      const { event } = data;
      form.setFieldsValue({
        name: event.name,
        start_time: moment(event.start_time),
        end_time: moment(event.end_time),
        on_line: event.on_line,
        is_hot: event.is_hot ? 1 : 0,
        extend: event.extend,
        source: event.source,
        show_price: event.show_price,
      });
      initImagesList(event);
    }
    setDetailData(tempData);
  };

  useEffect(() => {
    getDetailData();
    return () => {
      form.resetFields();
    };
  }, []);

  const handleDeleteImage = async () => {
    await deleteImage({ pic_url: delImagesList, pic_small_url: delImagesList });
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
    // 基本信息
    const fieldsValue = await form.validateFields();
    tempData.name = fieldsValue.name;
    tempData.on_line = fieldsValue.on_line;
    tempData.start_time = fieldsValue.start_time.format('YYYY-MM-DD HH:mm:ss');
    tempData.end_time = fieldsValue.end_time.format('YYYY-MM-DD HH:mm:ss');
    tempData.is_hot = !!fieldsValue.is_hot;
    tempData.extend = fieldsValue.extend;
    tempData.source = fieldsValue.source;
    tempData.show_price = fieldsValue.show_price;

    // 图片
    if (imagesList.length > 0) {
      const tempPicUrl: string[] = [];
      const tempPicSmallUrl: string[] = [];
      imagesList.forEach((item) => {
        tempPicUrl.push(splitImageUrl(item.url));
        tempPicSmallUrl.push(splitImageUrl(item.smallUrl));
      });
      tempData.pic_url = tempPicUrl;
      tempData.pic_small_url = tempPicSmallUrl;
    } else {
      tempData.pic_url = [];
      tempData.pic_small_url = [];
    }

    // console.log('-tempData-', tempData)

    const response = await modifyEvent({ id, data: tempData });
    if (response.code === 201) {
      if (delImagesList.length > 0) {
        handleDeleteImage();
      }
      message.success('编辑成功');
    }
  };

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

  const renderInfo = () => {
    const uploadButton = (
      <div style={{ width: '100px', height: '100px', display: 'grid', placeItems: 'center' }}>
        <PlusOutlined />
        上传图片
      </div>
    );

    return (
      <Form form={form} name="goodsInfoForm">
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item
              label="名称"
              name="name"
              rules={[
                {
                  required: true,
                  message: '请输入活动名称',
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="开始时间(JST)"
              name="start_time"
              rules={[
                {
                  required: true,
                  message: '请输入开始时间',
                },
              ]}
            >
              <DatePicker
                showTime
                style={{ width: '100%' }}
                disabledDate={(current) => current && current < moment().startOf('day')}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="结束时间(JST)"
              name="end_time"
              rules={[
                {
                  required: true,
                  message: '请输入结束时间',
                },
              ]}
            >
              <DatePicker
                showTime
                style={{ width: '100%' }}
                disabledDate={(current) => current && current < moment().startOf('day')}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item
              label="活动状态"
              name="on_line"
              rules={[
                {
                  required: true,
                  message: '请选择活动状态',
                },
              ]}
            >
              <Select>
                <Select.Option key="待上线" value={0}>
                  待上线
                </Select.Option>
                <Select.Option key="即将开始" value={1}>
                  即将开始
                </Select.Option>
                <Select.Option key="进行中" value={2}>
                  进行中
                </Select.Option>
                <Select.Option key="已完成" value={3}>
                  已完成
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="热门活动"
              name="is_hot"
              rules={[
                {
                  required: true,
                  message: '请选择热门状态',
                },
              ]}
            >
              <Select>
                <Select.Option key={0} value={0}>
                  否
                </Select.Option>
                <Select.Option key={1} value={1}>
                  是
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="举办方" name="source">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={4}>
            <Form.Item label="显示起拍价" name="show_price" valuePropName="checked">
              <Switch checkedChildren="√" unCheckedChildren="x" />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="封面图" name="cover">
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
          </Col>
          <Col span={16}>
            <Form.Item label="备注" name="extend">
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  };

  return (
    <PageContainer title="编辑活动" className={styles.container}>
      <Card title="基本信息" bodyStyle={{ padding: '10px 24px' }}>
        {renderInfo()}
        <div style={{ width: '100%', textAlign: 'center' }}>
          <Button
            type="primary"
            onClick={() => {
              submitForm();
            }}
          >
            确认提交
          </Button>
        </div>
      </Card>
      {detailData && (
        <Card title="活动商品" bodyStyle={{ padding: 25 }}>
          <EventGoods
            eventId={detailData.event.id}
            type="modify"
            listData={{
              data: detailData.items,
              page: detailData.page,
              total: detailData.total,
            }}
          />
        </Card>
      )}
    </PageContainer>
  );
};

export default EventModify;

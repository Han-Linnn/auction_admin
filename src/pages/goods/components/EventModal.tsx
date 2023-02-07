import React from 'react';
import moment from 'moment';
import { Form, Modal, Input, DatePicker } from 'antd';
import { createEvent } from '@/services/api';

const EventModal: React.FC<{ props: any }> = (props) => {
  const { eventVisible } = props;
  const [form] = Form.useForm();

  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
  };

  const submitForm = async () => {
    const params: API.EventData = {};
    const fieldsValue = await form.validateFields();
    params.name = fieldsValue.name;
    params.start_time = fieldsValue.start_time
      ? fieldsValue.start_time.format('YYYY-MM-DD HH:mm:ss')
      : moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    params.end_time = fieldsValue.end_time.format('YYYY-MM-DD HH:mm:ss');
    const response = await createEvent(params);
    if (response.code === 201) {
      const { data } = response;
      props.onOk(data.event_id);
    }
  };

  return (
    <Modal
      title="新增活动"
      visible={eventVisible}
      destroyOnClose
      onCancel={() => {
        form.resetFields();
        props.onCancel();
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
          label="开始时间(JST)"
          name="start_time"
          // rules={[{ required: true, message: '请输入开始时间' }]}
        >
          <DatePicker
            defaultValue={moment(new Date())}
            showTime
            style={{ width: '100%' }}
            disabledDate={(current) => current && current < moment().startOf('day')}
          />
        </Form.Item>
        <Form.Item
          label="结束时间(JST)"
          name="end_time"
          rules={[{ required: true, message: '请输入结束时间' }]}
        >
          <DatePicker
            showTime
            style={{ width: '100%' }}
            disabledDate={(current) => current && current < moment().startOf('day')}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default EventModal;

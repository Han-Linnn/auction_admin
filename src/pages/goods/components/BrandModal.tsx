import React from 'react';
import { Form, Modal, Input } from 'antd';
import { createBrand } from '@/services/api';

const BrandModal: React.FC<{ props: any }> = (props) => {
  const { cateId, brandVisible } = props
  const [form] = Form.useForm();

  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
  };

  const submitForm = async () => {
    const fieldsValue = await form.validateFields();
    const params = {
      cateId,
      data: {
        name: fieldsValue.name,
      }
    }
    const response = await createBrand(params);
    if (response.code === 200) {
      props.onOk(fieldsValue.name)
    }
  };

  return (
    <Modal
      title='新增品牌'
      visible={brandVisible}
      destroyOnClose
      onCancel={() => {
        form.resetFields();
        props.onCancel()
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
  )
}
export default BrandModal

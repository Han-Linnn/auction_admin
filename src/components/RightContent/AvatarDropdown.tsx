import React, { useCallback, useState } from 'react';
import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { /* Avatar, */ Menu, Spin, Modal, Form, Input, message } from 'antd';
import { history, useModel } from 'umi';
import { localRemove } from '@/utils/store';
import { postLogout, modifyPassWord } from '@/services/api';
// import { stringify } from 'querystring';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';

/**
 * 退出登录，并且将当前的 url 保存
 */
const loginOut = async () => {
  const response = await postLogout();
  if (response.code === 200) {
    localRemove('auctionAdminToken')
    history.push('/login');
  }
  // const { query, pathname } = history.location;
  // const { redirect } = query;
  // // Note: There may be security issues, please note
  // if (window.location.pathname !== '/login' && !redirect) {
  //   history.replace({
  //     pathname: '/login',
  //     search: stringify({
  //       redirect: pathname,
  //     }),
  //   });
  // }
};

const AvatarDropdown: React.FC<{}> = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const [form] = Form.useForm();
  const [visible, setVisible] = useState<boolean>(false)

  const onMenuClick = useCallback(
    (event: {
      key: React.Key;
      keyPath: React.Key[];
      item: React.ReactInstance;
      domEvent: React.MouseEvent<HTMLElement>;
    }) => {
      const { key } = event;
      if (key === 'logout' && initialState) {
        setInitialState({ ...initialState, currentUser: undefined });
        loginOut();
        return;
      } if (key === 'settings' && initialState) {
        setVisible(true)
      }
    },
    [],
  );

  const submitForm = async () => {
    const fieldsValue = await form.validateFields();
    const response = await modifyPassWord({
      password: fieldsValue.password,
      old_password: fieldsValue.old_password,
    })
    if (response.code === 201) {
      message.success('修改成功')
      setVisible(false)
      setInitialState({ ...initialState, currentUser: undefined });
      loginOut();
    }
  };

  const loading = (
    <span className={`${styles.action} ${styles.account}`}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  if (!initialState) {
    return loading;
  }

  const { currentUser } = initialState;

  if (!currentUser || !currentUser.username) {
    return loading;
  }

  const menuHeaderDropdown = (
    <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
      {/* {menu && (
        <Menu.Item key="center">
          <UserOutlined />
          个人中心
        </Menu.Item>
      )} */}

      <Menu.Item key="settings">
        <SettingOutlined />
        修改密码
        </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout">
        <LogoutOutlined />
        退出登录
      </Menu.Item>
    </Menu>
  );

  const renderModal = () => {
    const layout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };

    return (
      <Modal
        title='修改密码'
        visible={visible}
        destroyOnClose
        maskClosable={false}
        onCancel={() => {
          setVisible(false)
        }}
        onOk={() => {
          submitForm();
        }}
      >
        <Form {...layout} form={form}>
          <Form.Item
            label="原密码"
            name="old_password"
            rules={[{ required: true, message: '请输入原密码' }]}
          >
            <Input type='password' />
          </Form.Item>
          <Form.Item
            label="新密码"
            name="password"
            rules={[{ required: true, message: '请输入新密码' }]}
          >
            <Input type='password' />
          </Form.Item>
          <Form.Item
            label="确认密码"
            name="password2"
            rules={[{
              validator: (_, value, callback) => {
                if (value && value !== form.getFieldValue('password')) {
                  callback('两次密码输入不一致')
                } else {
                  callback()
                }
              }
            }]}
          >
            <Input type='password' />
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  return (
    <>
      <HeaderDropdown overlay={menuHeaderDropdown}>
        <span className={`${styles.action} ${styles.account}`} style={{ cursor: 'pointer' }}>
          {/* <Avatar size="small" className={styles.avatar} src={currentUser.avatar} alt="avatar" /> */}
          <UserOutlined />
          <span style={{ marginLeft: '5px' }}>{currentUser.username}</span>
        </span>
      </HeaderDropdown>
      {renderModal()}
    </>

  );
};

export default AvatarDropdown;

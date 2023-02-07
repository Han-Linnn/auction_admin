import {
  LockTwoTone,
  UserOutlined,
} from '@ant-design/icons';
import { message, Tabs } from 'antd';
import React, { useState } from 'react';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { Link, history, useModel } from 'umi';
import { postLogin, getUserInfo } from '@/services/api';
import { localSave } from '@/utils/store';
import styles from './index.less';

/**
 * 此方法会跳转到 redirect 参数所在的位置
 */
const goto = () => {
  if (!history) return;
  setTimeout(() => {
    history.push('/')
    // const { query } = history.location;
    // const { redirect } = query as { redirect: string };
    // history.push(redirect || '/goods');
  }, 10);
};

const Login: React.FC<{}> = () => {
  const [submitting, setSubmitting] = useState(false);
  const { initialState, setInitialState } = useModel('@@initialState');

  const fetchUserInfo = async () => {
    const response = await getUserInfo();
    if (response.code === 200) {
      const { data } = response;
      if (data) {
        setInitialState({
          ...initialState,
          currentUser: data,
        });
      }
    }
  };

  const handleSubmit = async (values: {
    username: string,
    password: string
  }) => {
    setSubmitting(true);
    const response = await postLogin(values);
    if (response.code === 200) {
      setSubmitting(false);
      const { data: { token } } = response;
      localSave('auctionAdminToken', token);
      /* 保持1天
      const expire = 3600 * 24;
          localSave('auctionAdminToken', token, expire);
      */
      await fetchUserInfo();
      goto();
      return;
    }
    // message.error('登录失败，请重试');
    setSubmitting(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.lang} />
      <div className={styles.content}>
        <div className={styles.top}>
          <div className={styles.header}>
            <Link to="/">
              <span className={styles.title}>
                在线拍卖系统管理后台
              </span>
            </Link>
          </div>
        </div>

        <div className={styles.main}>
          <ProForm
            initialValues={{
              autoLogin: true,
            }}
            submitter={{
              searchConfig: {
                submitText: '登录',
              },
              render: (_, dom) => dom.pop(),
              submitButtonProps: {
                loading: submitting,
                size: 'large',
                style: {
                  width: '100%',
                },
              },
            }}
            onFinish={async (values) => {
              handleSubmit(values);
            }}
          >
            <Tabs>
              <Tabs.TabPane
                key="account"
                tab='账户密码登录'
              />
            </Tabs>
            <>
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined className={styles.prefixIcon} />,
                }}
                placeholder='用户名'
                rules={[
                  {
                    required: true,
                    message: ('请输入用户名'),
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockTwoTone className={styles.prefixIcon} />,
                }}
                placeholder='密码'
                rules={[
                  {
                    required: true,
                    message: "请输入密码！",
                  },
                ]}
              />
            </>
          </ProForm>
        </div>
      </div>
    </div>
  );
};

export default Login;

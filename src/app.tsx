import React from 'react';
import { Settings as LayoutSettings, PageLoading } from '@ant-design/pro-layout';
import { message, notification } from 'antd';
import { RequestConfig, history, RunTimeLayoutConfig } from 'umi';
import RightContent from '@/components/RightContent';
// import Footer from '@/components/Footer';
import { ResponseError, RequestOptionsInit } from 'umi-request';
import { apiURL } from '@/utils/constants'
import { localGet, localRemove } from '@/utils/store';
import { getUserInfo } from '@/services/api';
import defaultSettings from '../config/defaultSettings';

const gotoLogin = () => {
  localRemove('auctionAdminToken')
  history.push('/login');
}

/**
 * 获取用户信息比较慢的时候会展示一个 loading
 */
export const initialStateConfig = {
  loading: <PageLoading />,
};

export async function getInitialState(): Promise<{
  settings?: LayoutSettings;
  currentUser?: API.CurrentUser;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    const auctionAdminToken = localGet('auctionAdminToken');
    if (auctionAdminToken) {
      const response = await getUserInfo();
      if (response.code === 200) {
        const { data } = response;
        if (data) {
          return data
        }
        gotoLogin()
      }
    }
    gotoLogin()
  };
  // 如果是登录页面，不执行
  if (history.location.pathname !== '/login') {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: defaultSettings,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings,
  };
}

export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  const auctionAdminToken = localGet('auctionAdminToken');
  return {
    rightContentRender: () => <RightContent />,
    disableContentMargin: false,
    // footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!auctionAdminToken && !initialState?.currentUser && location.pathname !== '/login') {
        gotoLogin()
      }
    },
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    ...initialState?.settings,
  };
};

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  405: '请求方法不被允许。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

/**
 * 异常处理程序
 */
const errorHandler = (error: ResponseError) => {
  const { response } = error;
  if (response && response.status) {
    const errorText = codeMessage[response.status] || response.statusText;
    const { status, url } = response;

    notification.error({
      message: `请求错误 ${status}: ${url}`,
      description: errorText,
    });
  }

  if (!response) {
    notification.error({
      description: '您的网络发生异常，无法连接服务器',
      message: '网络异常',
    });
  }
  throw error;
};


const authHeaderInterceptor = (url: string, options: RequestOptionsInit) => {
  const auctionAdminToken = localGet('auctionAdminToken');
  if (auctionAdminToken) {
    const authHeader = { 'Authorization': `Bearer ${auctionAdminToken}` }
    return {
      url: `${url}`,
      options: { ...options, interceptors: true, headers: authHeader },
    };
  }
  return {
    url: `${url}`,
    options,
  };
}

const responseStatusInterceptors = async (response: Response /* , options: RequestOptionsInit */) => {
  const data = await response.clone().json();
  const { code, msg } = data;
  const lstSuccess = [200, 201, 202, 204]
  const lstWarning = [400, 401, 403, 404, 406, 410, 413, 422, 429]
  const lstError = [500, 502, 503, 504]

  if (!lstSuccess.includes(code)) {
    if (lstWarning.includes(code)) {
      message.warning(msg)
      if (code === 401) {
        gotoLogin()
      }
    } else if (lstError.includes(code)) {
      message.error(msg)
    } else {
      message.warning(msg)
    }
  }
  return response;
}

export const request: RequestConfig = {
  prefix: apiURL,
  errorHandler,
  credentials: 'include',// 不论是不是跨域的请求,总是发送请求资源域在本地的 cookies、 HTTP Basic authentication 等验证信息.
  requestInterceptors: [authHeaderInterceptor], // 请求前拦截
  responseInterceptors: [responseStatusInterceptors], // 响应后拦截
};

import { Settings as LayoutSettings } from '@ant-design/pro-layout';

const Settings: LayoutSettings & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: 'dark',
  // 拂晓蓝
  primaryColor: '#1890ff',
  layout: 'side', // 'mix',
  contentWidth: 'Fluid',
  // headerRender:false,
  // footerRender: false,
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  title: '在线拍卖系统',
  pwa: false,
  logo:false, // 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
  iconfontUrl: '',
};

export default Settings;

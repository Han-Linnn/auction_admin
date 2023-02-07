declare namespace API {
  export interface CurrentUser {
    id?: string;
    auth: number; //1：普通用户, 2:管理员
    avatar?: string;
    create_time: string;
    email: string;
    extend: string;
    login_count: number;
    moblie: string;
    permission: any;
    role_id: number;
    update_time: string;
    username?: string;
    // active: boolean;
    // title?: string;
    // group?: string;
    // signature?: string;
    // tags?: {
    //   key: string;
    //   label: string;
    // }[];
    // access?: 'user' | 'guest' | 'admin';
    // unreadCount?: number;
  }

  // export interface LoginStateType {
  //   status?: 'ok' | 'error';
  //   type?: string;
  // }

  export interface NoticeIconData {
    id: string;
    key: string;
    avatar: string;
    title: string;
    datetime: string;
    type: string;
    read?: boolean;
    description: string;
    clickClose?: boolean;
    extra: any;
    status: string;
  }

  export interface GoodsData {
    title: string;
    category_id: number;
    start_price: number;
    last_price: number;
    final_price: number;
    property_json: any;
    start_time: string;
    end_time: string;
    pic_url: string[];
    pic_small_url: string[];
    is_sale: boolean;
    source: string;
    goods_code: string;
    event_id: string;
  }

  export interface EventData {
    name: string;
    start_time: number;
    end_start: number;
    on_line: boolean;
    pic_url: string[];
    pic_small_url: string[];
    extend: string;
    //---^^新增---vv编辑---
    goods_id: string[];
    oper_type: string; // add,delete 默认为add
  }
}

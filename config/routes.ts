export default [
  {
    path: '/',
    redirect: '/goods',
  },
  {
    path: '/login',
    layout: false,
    routes: [
      {
        path: '/login',
        component: './user/login',
      },
    ],
  },
  {
    path: '/goods',
    name: 'goods',
    icon: 'shop',
    access: 'canGoodsMgnt',
    routes: [
      {
        path: '/goods',
        redirect: '/goods/list',
      },
      {
        path: '/goods/list',
        name: 'goodsList',
        component: './goods/GoodsList',
      },
      {
        path: '/goods/detail',
        component: './goods/GoodsDetail',
      },
      {
        path: '/goods/modify',
        component: './goods/GoodsModify',
      },
    ],
  },
  {
    path: '/event',
    name: 'event',
    icon: 'shopping',
    access: 'canEventMgnt',
    routes: [
      {
        path: '/event/list',
        name: 'eventList',
        component: './event/EventList',
      },
      {
        path: '/event/modify',
        component: './event/EventModify',
      },
      {
        path: '/event/bidding',
        name: 'bidding',
        component: './event/Bidding',
      },
      {
        path: '/event/result',
        name: 'result',
        component: './event/Bidding', // './event/BidResult',
      },
    ],
  },
  {
    path: '/category',
    name: 'category',
    icon: 'bars',
    access: 'canCategoryMgnt',
    routes: [
      {
        path: '/category/list',
        name: 'categoryList',
        component: './category/CategoryList',
      },
      {
        path: '/category/brand',
        component: './brand/BrandList',
      },
      {
        path: '/category/series',
        component: './brand/SeriesList',
      },
      {
        path: '/category/specification',
        component: './specification/SpecificationList',
      },
      {
        path: '/category/attributeList',
        component: './specification/AttributeList',
      },
    ],
  },
  // {
  //   path: '/bidRule',
  //   name: 'bidRule',
  //   icon: 'diff',
  //   access: 'canBidMgnt',
  //   routes: [
  //     {
  //       path: '/bidRule/list',
  //       name: 'bidRuleList',
  //       component: './bidRule/BidRuleList',
  //     },
  //   ],
  // },
  {
    path: '/user',
    name: 'user',
    icon: 'user',
    access: 'canUserMgnt',
    routes: [
      {
        path: '/user/list',
        name: 'userList',
        component: './user/UserList',
      },
      {
        path: '/user/roleList',
        name: 'roleList',
        component: './auth/RoleList',
      },
      // {
      //   path: '/user/authList',
      //   name: 'authList',
      //   component: './auth/AuthList',
      // }
    ],
  },
  {
    path: '/crawler',
    name: 'crawler',
    icon: 'bug',
    access: 'canCrawlerMgnt',
    routes: [
      {
        path: '/crawler/task',
        name: 'crawlerTaskList',
        component: './crawler/CrawlerTaskList',
      },
    ],
  },
  {
    path: '/recycle',
    name: 'recycle',
    icon: 'rest',
    access: 'canRecycleMgnt',
    routes: [
      {
        path: '/recycle/recycleList',
        name: 'recycleList',
        component: './recycle/RecycleList',
      },
    ],
  },
  {
    path: '/translate',
    name: 'translate',
    icon: 'global',
    access: 'canTranslateMgnt',
    routes: [
      {
        path: '/translate/translateList',
        name: 'translateList',
        component: './translate/TranslateList',
      },
    ],
  },
  {
    path: '/fee',
    name: 'fee',
    icon: 'DollarOutlined',
    // access: 'canCrawlerMgnt',
    component: './fee/FeeList',
    // routes: [
    //   {
    //     path: '/fee/list',
    //     name: 'fee',
    //     component: './fee/FeeList',
    //   },
    // ],
  },
  {
    component: './404',
  },
];

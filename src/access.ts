// src/access.ts
export default function access(initialState: { currentUser?: API.CurrentUser | undefined }) {
  const { currentUser } = initialState || {};
  const permissionList = [] as string[]
  if (currentUser && 'permission' in currentUser) {
    currentUser.permission.forEach((item: any) => {
      permissionList.push(item.name)
    })
  }

  const checkPermission = (name: string) => {
    if (permissionList.length > 0) {
      return permissionList.includes(name)
    }
    return false
  }

  /*
    1.browse 浏览网页
    2.follow 关注
    3.collect 收藏
    4.userBid 参与竞价
    5.category 分类管理
    6.good 商品管理
    7.event 活动管理
    8.bid 出价管理
    9.user 用户管理
    10.crawler 爬虫管理
    11.recycle 回收站管理
    12.translate 翻译管理
  */

  return {
    canBrowse: checkPermission('browse'),
    canFollow: checkPermission('follow'),
    canCollection: checkPermission('collect'),
    canBid: checkPermission('userBid'),

    canCategoryMgnt: checkPermission('category'),
    canGoodsMgnt: checkPermission('good'),
    canEventMgnt: checkPermission('event'),
    canBidMgnt: checkPermission('bid'),
    canUserMgnt: checkPermission('user'),
    canCrawlerMgnt: checkPermission('crawler'),
    canRecycleMgnt: checkPermission('recycle'),
    canTranslateMgnt: checkPermission('translate'),
  };
}

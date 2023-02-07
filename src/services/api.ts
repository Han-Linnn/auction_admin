import { request } from 'umi';

/// ------登录管理------- ///
export async function postLogin(params: { username: string; password: string }) {
  return request('/user/login', {
    method: 'POST',
    data: {
      username: params.username,
      password: params.password,
      auth: 2,
    },
  });
}

export async function postLogout() {
  return request('/user/logout', {
    method: 'POST',
  });
}

export async function getUserInfo() {
  return request('/user/info', {
    method: 'GET',
  });
}

/// ------用户管理------- ///
export async function getUserList(params: any) {
  return request('/user/list', {
    method: 'GET',
    params,
  });
}

export async function createUser(params: any) {
  return request('/user', {
    method: 'POST',
    data: params,
  });
}

export async function modifyUserInfo(params: any) {
  return request(`/user/${params.id}`, {
    method: 'PUT',
    data: params,
  });
}

export async function deleteUser(id: number) {
  return request(`/user/${id}`, {
    method: 'DELETE',
  });
}

export async function modifyPassWord(params: { password: string; old_password: string }) {
  return request('/user/password', {
    method: 'PUT',
    data: {
      password: params.password,
      old_password: params.old_password,
    },
  });
}

export async function createRandomUser(params: any) {
  return request('/user/random', {
    method: 'POST',
    data: params,
  });
}

// 用户名字输入联想
export async function getUserName(params: any) {
  return request('/user/keyword', {
    method: 'GET',
    params,
  });
}

/// ------分类管理------- ///
export async function getGoodsCate(params: any) {
  return request('/goods/admin/cate', {
    method: 'GET',
    params,
  });
}

export async function getAllGoodsCate(params: any) {
  return request('/goods/admin/cate/all', {
    method: 'GET',
    params,
  });
}

export async function modifyCategory(params: {
  id: number;
  category_name: string;
  show_seq: number;
  parent_id: number;
  level: number;
}) {
  return request(`/goods/admin/cate/${params.id}`, {
    method: 'PUT',
    data: {
      category_name: params.category_name,
      show_seq: params.show_seq,
      parent_id: params.parent_id,
      level: params.level,
    },
  });
}

export async function createCategory(params: {
  category_name: string;
  show_seq: number;
  parent_id: number;
  level: number;
}) {
  return request('/goods/admin/cate', {
    method: 'POST',
    data: {
      category_name: params.category_name,
      show_seq: params.show_seq,
      parent_id: params.parent_id,
      level: params.level,
    },
  });
}

export async function deleteCategory(id: number) {
  return request(`/goods/admin/cate/${id}`, {
    method: 'DELETE',
  });
}

export async function getCategoryTree(cateId: number) {
  return request(`/cate/tree/${cateId}`, {
    method: 'GET',
  });
}

// 分类规格属性树形结构
export async function getSpecificationTree(cateId: number) {
  return request('/goods/admin/specification/tree', {
    method: 'GET',
    params: { category_id: cateId },
  });
}

/// ------商品管理------- ///
export async function getGoodsData(params: any) {
  return request('/goods/admin', {
    method: 'GET',
    params,
  });
}

export async function updataSaleState(params: { goods_list: string; is_sale: number }) {
  return request('/goods/admin', {
    method: 'PUT',
    data: {
      goods_list: params.goods_list,
      is_sale: params.is_sale,
    },
  });
}

export async function deleteGoods(params: { goods_list: string }) {
  return request('/goods/admin/delete', {
    method: 'POST',
    data: {
      goods_list: params.goods_list,
    },
  });
}

export async function createGoods(params: API.GoodsData) {
  return request('/goods/admin', {
    method: 'POST',
    data: params,
  });
}

export async function modifyGoods(params: { id: number; data: API.GoodsData }) {
  return request(`/goods/admin/${params.id}`, {
    method: 'PUT',
    data: { ...params.data },
  });
}

// 商品名字输入联想
export async function getGoodsName(params: any) {
  return request('/goods/keyword', {
    method: 'GET',
    params,
  });
}

// 修改商品推送状态
export async function updataGoogsPush(params: any) {
  return request('/goods/admin/push', {
    method: 'POST',
    data: params,
  });
}

/// ------图片管理------- ///
export async function deleteImage(params: { pic_url: string[]; pic_small_url: string[] }) {
  return request('/upload/delete', {
    method: 'POST',
    data: {
      pic_url: params.pic_url,
      pic_small_url: params.pic_small_url,
    },
  });
}

/// ------活动管理------- ///
export async function getEventList(params: any) {
  return request('/event/admin/list', {
    method: 'GET',
    params,
  });
}

export async function getEventDetail(params: any) {
  return request(`/event/admin/${params.id}`, {
    method: 'GET',
    params: params?.data,
  });
}

export async function createEvent(params: API.EventData) {
  return request('/event/admin', {
    method: 'POST',
    data: params,
  });
}

export async function modifyEvent(params: { id: number; data: API.EventData }) {
  return request(`/event/admin/${params.id}`, {
    method: 'PUT',
    data: { ...params.data },
  });
}

export async function deleteEvent(id: number) {
  return request(`/event/admin/${id}`, {
    method: 'DELETE',
  });
}

export async function getAllEvent(params: any) {
  return request('/event/admin/all', {
    method: 'GET',
    params,
  });
}

export async function getEventBidding(params: any) {
  return request('/user_bid', {
    method: 'GET',
    params,
  });
}

export async function getEventResult(params: any) {
  return request('/user_bid/success', {
    method: 'GET',
    params,
  });
}

export async function getBiddingHistory(params: any) {
  return request('/user_bid/history', {
    method: 'GET',
    params,
  });
}

export async function getExportEvent(params: any) {
  return request('/user_bid/export', {
    method: 'GET',
    params,
  });
}

/// ------出价管理------- ///
export async function getBidRule(params: any) {
  return request('/bid_rule/rule', {
    method: 'GET',
    params,
  });
}

export async function modifyBidRule(params: any) {
  return request('/bid_rule/rule', {
    method: 'PUT',
    data: { rule: params },
  });
}

/// ------品牌管理------- ///
export async function getBrand(params: any) {
  return request(`/cate/${params.cateId}/brand`, {
    method: 'GET',
    params: params.data,
  });
}

export async function createBrand(params: any) {
  return request(`/cate/${params.cateId}/brand`, {
    method: 'POST',
    data: params.data,
  });
}

export async function modifyBrand(params: any) {
  return request(`/cate/brand/${params.brandId}`, {
    method: 'PUT',
    data: params.data,
  });
}

export async function deleteBrand(id: number) {
  return request(`/cate/brand/${id}`, {
    method: 'DELETE',
  });
}

/// ------系列管理------- ///
export async function getSeries(params: any) {
  return request(`/cate/brand/${params.brandId}/series`, {
    method: 'GET',
    params: params.data,
  });
}

export async function createSeries(params: any) {
  return request(`/cate/brand/${params.brandId}/series`, {
    method: 'POST',
    data: params.data,
  });
}

export async function modifySeries(params: any) {
  return request(`/cate/brand/series/${params.seriesId}`, {
    method: 'PUT',
    data: params.data,
  });
}

export async function deleteSeries(id: number) {
  return request(`/cate/brand/series/${id}`, {
    method: 'DELETE',
  });
}

/// ------爬虫管理------- ///
export async function getCrawler(params: any) {
  return request('/crawler', {
    method: 'GET',
    params,
  });
}

export async function getCrawlerTask(params: any) {
  return request('/crawler/task', {
    method: 'GET',
    params,
  });
}

export async function createCrawlerTask(params: any) {
  return request('/crawler/task', {
    method: 'POST',
    data: params,
  });
}

export async function deleteCrawlerTask(id: number) {
  return request(`/crawler/task/${id}`, {
    method: 'DELETE',
  });
}

export async function cancelCrawlerTask(id: number) {
  return request(`/crawler/task/${id}`, {
    method: 'PUT',
  });
}

/// ------角色管理------- ///
export async function getRole(params: any) {
  return request('/user/role', {
    method: 'GET',
    params,
  });
}

export async function createRole(params: any) {
  return request('/user/role', {
    method: 'POST',
    data: params,
  });
}

export async function modifyRole(params: any) {
  return request(`/user/role/${params.id}`, {
    method: 'PUT',
    data: params.data,
  });
}

export async function deleteRole(id: number) {
  return request(`/user/role/${id}`, {
    method: 'DELETE',
  });
}

export async function getRoleDetail(id: number) {
  return request(`/user/role/${id}`, {
    method: 'GET',
  });
}

/// ------角色权限管理------- ///
export async function getPermission(params: any) {
  return request('/user/role/permission', {
    method: 'GET',
    params,
  });
}

export async function createPermission(params: any) {
  return request('/user/role/permission', {
    method: 'POST',
    data: params,
  });
}

export async function modifyPermission(params: any) {
  return request(`/user/role/permission/${params.id}`, {
    method: 'PUT',
    data: params.data,
  });
}

export async function deletePermission(id: number) {
  return request(`/user/role/permission/${id}`, {
    method: 'DELETE',
  });
}

/// ------规格管理------- ///
export async function getSpecification(params: any) {
  return request('/goods/admin/specification/list', {
    method: 'GET',
    params,
  });
}

export async function createSpecification(params: any) {
  return request('/goods/admin/specification', {
    method: 'POST',
    data: params,
  });
}

export async function modifySpecification(params: any) {
  return request(`/goods/admin/specification/${params.id}`, {
    method: 'PUT',
    data: params.data,
  });
}

export async function deleteSpecification(id: number) {
  return request(`/goods/admin/specification/${id}`, {
    method: 'DELETE',
  });
}

/// ------属性管理------- ///
export async function getAttribute(params: any) {
  return request('/goods/admin/attribute/list', {
    method: 'GET',
    params,
  });
}

export async function createAttribute(params: any) {
  return request('/goods/admin/attribute', {
    method: 'POST',
    data: params,
  });
}

export async function modifyAttribute(params: any) {
  return request(`/goods/admin/attribute/${params.id}`, {
    method: 'PUT',
    data: params.data,
  });
}

export async function deleteAttribute(id: number) {
  return request(`/goods/admin/attribute/${id}`, {
    method: 'DELETE',
  });
}

/// ------回收站------- ///
export async function getRecycleList(params: any) {
  return request('/recycle_bin', {
    method: 'GET',
    params,
  });
}

export async function recoverRecycle(params: { operate_type: number; operate_list: string }) {
  return request('/recycle_bin', {
    method: 'PUT',
    data: {
      operate_type: params.operate_type,
      operate_list: params.operate_list,
    },
  });
}

export async function deleteRecycle(params: { operate_type: number; operate_list: string }) {
  return request('/recycle_bin', {
    method: 'delete',
    data: {
      operate_type: params.operate_type,
      operate_list: params.operate_list,
    },
  });
}

/// ------翻译字典------- ///
export async function getTranslate(params: any) {
  return request('/translate', {
    method: 'GET',
    params,
  });
}

export async function createTranslate(params: any) {
  return request('/translate', {
    method: 'POST',
    data: params,
  });
}

export async function modifyTranslate(params: any) {
  return request(`/translate/${params.id}`, {
    method: 'PUT',
    data: params.data,
  });
}

export async function deleteTranslate(id: number) {
  return request(`/translate/${id}`, {
    method: 'DELETE',
  });
}

export async function batchDeleteTranslate(params: any) {
  return request('/translate', {
    method: 'DELETE',
    data: params,
  });
}

/// ------手续费------- ///
export async function getFee(params: any) {
  return request('/user_bid/rate', {
    method: 'GET',
    params,
  });
}

export async function modifyFee(params: any) {
  return request('/user_bid/rate', {
    method: 'POST',
    data: params,
  });
}

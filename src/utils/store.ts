const engine = require('store/src/store-engine');
const localStorage = require('store/storages/localStorage');
const expirePlugin = require('store/plugins/expire');

const localStorages = [localStorage];
const plugins = [expirePlugin];

const localStore = engine.createStore(localStorages, plugins);

exports.localStore = localStore;

// ########localStore###########
/**
 * 保存数据
 * @param key
 * @param value
 * @param expire 过期时间（seconds）
 */
exports.localSave = (key: string, value: string, expire: number) => {
  if (expire) {
    localStore.set(key, value, new Date().getTime() + expire * 1000);
  } else {
    localStore.set(key, value);
  }
};

/**
 * 获取值
 * @param key
 */
exports.localGet = (key: string) => localStore.get(key);

/**
 * 删除数据
 */
exports.localRemove = (key: string) => {
  localStore.remove(key);
};

/**
 * 删除所有
 */
exports.localClearAll = () => {
  localStore.clearAll();
};

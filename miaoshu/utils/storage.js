/**
 * 本地缓存封装
 */

export function setStorage(key, value) {
  try {
    wx.setStorageSync(key, value);
  } catch (e) {
    console.error('[storage] set error', e);
  }
}

export function getStorage(key, defaultValue = null) {
  try {
    return wx.getStorageSync(key) || defaultValue;
  } catch (e) {
    console.error('[storage] get error', e);
    return defaultValue;
  }
}

export function removeStorage(key) {
  try {
    wx.removeStorageSync(key);
  } catch (e) {
    console.error('[storage] remove error', e);
  }
}

export function clearStorage() {
  try {
    wx.clearStorageSync();
  } catch (e) {
    console.error('[storage] clear error', e);
  }
}

import { userStore } from './store/index';
import { initMockData } from './services/mock-data';

App({
  globalData: {
    userInfo: null,
    systemInfo: null,
  },

  onLaunch() {
    console.log('[App] 喵舒启动');
    this.globalData.systemInfo = wx.getSystemInfoSync();
    initMockData();
    this._checkAuth();
  },

  onShow() {
    console.log('[App] 喵舒进入前台');
  },

  onHide() {
    console.log('[App] 喵舒进入后台');
  },

  _checkAuth() {
    const token = wx.getStorageSync('access_token');
    if (!token) {
      console.log('[App] 未登录，使用游客模式');
      userStore.setIsGuest(true);
      userStore.setUserInfo({ nickname: '喵舒用户' });
    } else {
      userStore.loadFromStorage();
    }
  },
});

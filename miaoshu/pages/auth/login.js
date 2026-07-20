import { userStore } from '../../store/index';

Page({
  data: {
    agreed: false,
  },

  toggleAgreement() {
    this.setData({ agreed: !this.data.agreed });
  },

  onLogin() {
    if (!this.data.agreed) {
      wx.showToast({ title: '请先同意隐私协议', icon: 'none' });
      return;
    }

    wx.login({
      success: (res) => {
        if (res.code) {
          // 真实环境：将 code 发送给后端，换取 openid 和 token
          userStore.setUserInfo({
            nickname: '喵舒用户',
            openid: `openid_${res.code.slice(-8)}`,
          });
          wx.setStorageSync('access_token', `mock_token_${Date.now()}`);
          wx.switchTab({ url: '/pages/home/index' });
        }
      },
    });
  },

  goPrivacy() {
    wx.navigateTo({ url: '/pages/auth/privacy' });
  },
});

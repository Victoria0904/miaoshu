import { userStore } from '../../store/index';
import { loginWithWechat } from '../../services/auth';

Page({
  data: {
    agreed: false,
  },

  toggleAgreement() {
    this.setData({ agreed: !this.data.agreed });
  },

  async onLogin() {
    if (!this.data.agreed) {
      wx.showToast({ title: '请先同意隐私协议', icon: 'none' });
      return;
    }

    try {
      const { user } = await loginWithWechat();
      userStore.setUserInfo({
        openid: user.openid,
        nickname: user.nickname || '喵舒用户',
      });
      wx.showToast({ title: '登录成功', icon: 'success' });
      wx.switchTab({ url: '/pages/home/index' });
    } catch (err) {
      console.error('[login] failed', err);
      wx.showToast({ title: '登录失败，请重试', icon: 'none' });
    }
  },

  goPrivacy() {
    wx.navigateTo({ url: '/pages/auth/privacy' });
  },
});

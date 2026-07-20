import { userStore } from '../../store/index';
import { getPainRecords } from '../../services/pain-record';

Page({
  data: {
    user: {},
    recentRecords: [],
    reviewData: {
      stolenBeautyHours: 12.5,
    },
    daysToNextPeriod: 7,
    showMedicalAlert: true,
    todayTips: [
      { icon: '🔥', title: '经期第 2 天·疼痛高峰期', desc: '建议热敷腹部，避免冷饮和剧烈运动' },
      { icon: '🍵', title: '饮食建议', desc: '宫寒体质·宜温热饮食，推荐红糖姜茶' },
      { icon: '🧘', title: '舒缓动作', desc: '猫牛式伸展 5 分钟，缓解腰部坠痛' },
    ],
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  async loadData() {
    const user = userStore.toJSON ? userStore.toJSON() : {};
    const records = await getPainRecords(user.openid);
    const recent = (records || []).slice(0, 3).map((r) => ({
      ...r,
      intensityClass: this._getIntensityClass(r.painIntensity),
      periodText: r.periodDay ? `· 经期第${r.periodDay}天` : '· 非经期',
    }));

    this.setData({
      user,
      recentRecords: recent,
      stolenDays: (this.data.reviewData.stolenBeautyHours / 24).toFixed(1),
    });
  },

  _getIntensityClass(intensity) {
    if (intensity <= 3) return 'intensity-low';
    if (intensity <= 6) return 'intensity-mid';
    return 'intensity-high';
  },

  goRelief() {
    wx.navigateTo({ url: '/pages/relief/index' });
  },

  goReport() {
    wx.switchTab({ url: '/pages/profile/index' });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    wx.switchTab({ url: `/pages/${tab}/index` });
  },

  viewRecord(e) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({ title: `记录 ${id}`, icon: 'none' });
  },
});

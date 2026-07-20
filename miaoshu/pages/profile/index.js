import { userStore, painRecordStore } from '../../store/index';
import { getPainRecords } from '../../services/pain-record';
import { generateMedicalReport } from '../../services/ai-report';
import { getMonthlyReview } from '../../services/review';

Page({
  data: {
    user: {},
    showReport: false,
    generating: false,
    medicalReport: {},
    recordCount: 0,
    avgIntensity: 0,
    stolenHours: 0,
    reviewData: {},
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
    const review = await getMonthlyReview('2026-07');

    const total = (records || []).reduce((sum, r) => sum + r.painIntensity, 0);
    const avg = records && records.length ? (total / records.length).toFixed(1) : 0;

    this.setData({
      user,
      recordCount: (records || []).length,
      avgIntensity: avg,
      stolenHours: review.stolenBeautyHours,
      reviewData: review,
    });
  },

  async generateReport() {
    this.setData({ showReport: true, generating: true });
    try {
      const report = await generateMedicalReport([]);
      this.setData({
        generating: false,
        medicalReport: report,
      }, () => {
        this.renderReportChart();
      });
    } catch (e) {
      this.setData({ generating: false });
      wx.showToast({ title: '报告生成失败', icon: 'none' });
    }
  },

  renderReportChart() {
    const query = wx.createSelectorQuery().in(this);
    query.select('#reportTrendChart').fields({ node: true, size: true }).exec((res) => {
      if (!res[0]) return;
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      const dpr = wx.getSystemInfoSync().pixelRatio;
      canvas.width = res[0].width * dpr;
      canvas.height = res[0].height * dpr;
      ctx.scale(dpr, dpr);

      const data = this.data.medicalReport.trendData || [3.8, 4.2, 4.5, 5.1, 6.8, 7.5];
      const labels = this.data.medicalReport.trendLabels || ['2月', '3月', '4月', '5月', '6月', '7月'];
      const width = res[0].width;
      const height = res[0].height;
      const padding = 30;
      const chartW = width - padding * 2;
      const chartH = height - padding * 2;

      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = '#f0f0f0';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const y = padding + (chartH / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }

      const stepX = chartW / (data.length - 1);
      ctx.beginPath();
      data.forEach((val, index) => {
        const x = padding + stepX * index;
        const y = padding + chartH - (val / 10) * chartH;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#E65555';
      ctx.lineWidth = 3;
      ctx.stroke();

      data.forEach((val, index) => {
        const x = padding + stepX * index;
        const y = padding + chartH - (val / 10) * chartH;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#E65555';
        ctx.fill();
        ctx.fillStyle = '#999';
        ctx.font = '18rpx sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(labels[index], x, height - 8);
      });
    });
  },

  downloadReport() {
    wx.showToast({ title: 'PDF 生成中（Demo）', icon: 'none' });
  },

  showPrivacy() {
    wx.navigateTo({ url: '/pages/auth/privacy' });
  },

  exportData() {
    wx.showToast({ title: '数据导出中...', icon: 'none' });
  },

  deleteData() {
    wx.showModal({
      title: '删除全部数据',
      content: '确定删除全部数据？此操作不可撤销。',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '数据已删除', icon: 'success' });
        }
      },
    });
  },
});

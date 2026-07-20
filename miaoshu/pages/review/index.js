import { getMonthlyReview } from '../../services/review';

Page({
  data: {
    reviewData: {},
    stolenDays: 0,
  },

  onLoad() {
    this.loadReview();
  },

  onShow() {
    this.loadReview();
  },

  async loadReview() {
    const data = await getMonthlyReview('2026-07');
    this.setData({
      reviewData: data,
      stolenDays: (data.stolenBeautyHours / 24).toFixed(1),
    }, () => {
      this.renderTimeRingChart();
      this.renderTrendChart();
    });
  },

  renderTimeRingChart() {
    const query = wx.createSelectorQuery().in(this);
    query.select('#timeRingChart').fields({ node: true, size: true }).exec((res) => {
      if (!res[0]) return;
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      const dpr = wx.getSystemInfoSync().pixelRatio;
      canvas.width = res[0].width * dpr;
      canvas.height = res[0].height * dpr;
      ctx.scale(dpr, dpr);

      const data = this.data.reviewData.timeBreakdown || [];
      const total = data.reduce((sum, item) => sum + item.hours, 0);
      const cx = res[0].width / 2;
      const cy = res[0].height / 2;
      const radius = Math.min(cx, cy) - 20;
      let startAngle = -Math.PI / 2;

      data.forEach((item) => {
        const slice = (item.hours / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, startAngle + slice);
        ctx.closePath();
        ctx.fillStyle = item.color;
        ctx.fill();
        startAngle += slice;
      });

      // 中心圆
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();

      // 文字
      ctx.fillStyle = '#333';
      ctx.font = 'bold 32rpx sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('五种时间', cx, cy - 6);
      ctx.font = '22rpx sans-serif';
      ctx.fillStyle = '#999';
      ctx.fillText('月度分布', cx, cy + 20);
    });
  },

  renderTrendChart() {
    const query = wx.createSelectorQuery().in(this);
    query.select('#trendChart').fields({ node: true, size: true }).exec((res) => {
      if (!res[0]) return;
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      const dpr = wx.getSystemInfoSync().pixelRatio;
      canvas.width = res[0].width * dpr;
      canvas.height = res[0].height * dpr;
      ctx.scale(dpr, dpr);

      const data = this.data.reviewData.trendData || [3.8, 4.2, 4.5, 5.1, 6.8, 7.5];
      const labels = this.data.reviewData.trendLabels || ['2月', '3月', '4月', '5月', '6月', '7月'];
      const width = res[0].width;
      const height = res[0].height;
      const padding = 40;
      const chartW = width - padding * 2;
      const chartH = height - padding * 2;

      ctx.clearRect(0, 0, width, height);

      // 网格线
      ctx.strokeStyle = '#f0f0f0';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const y = padding + (chartH / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }

      // 折线
      const stepX = chartW / (data.length - 1);
      ctx.beginPath();
      data.forEach((val, index) => {
        const x = padding + stepX * index;
        const y = padding + chartH - (val / 10) * chartH;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#E8919C';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 点 + 标签
      data.forEach((val, index) => {
        const x = padding + stepX * index;
        const y = padding + chartH - (val / 10) * chartH;
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#E8919C';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 月份标签
        ctx.fillStyle = '#999';
        ctx.font = '20rpx sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(labels[index], x, height - 10);
      });
    });
  },
});

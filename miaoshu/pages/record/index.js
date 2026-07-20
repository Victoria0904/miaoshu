import { userStore, painRecordStore } from '../../store/index';
import { getPainRecords, createPainRecord } from '../../services/pain-record';
import { PAIN_TYPES, SYMPTOM_OPTIONS, SCENES } from '../../utils/constants';

const ZONES = [
  { name: 'uterus', label: '子宫区', center: { x: 100, y: 130 } },
  { name: 'pelvic', label: '盆腔区', center: { x: 100, y: 165 } },
  { name: 'lumbar-l', label: '腰部', center: { x: 66, y: 150 } },
  { name: 'lumbar-r', label: '腰部', center: { x: 134, y: 150 } },
  { name: 'thigh', label: '大腿根部', center: { x: 100, y: 190 } },
];

Page({
  data: {
    painTypes: PAIN_TYPES,
    symptomOptions: SYMPTOM_OPTIONS,
    sceneOptions: SCENES,
    intensityOptions: ['轻度', '中度', '重度'],
    painIntensity: 5,
    painType: '绞痛',
    symptoms: [],
    scene: 'home',
    painDots: [],
    records: [],
    recordView: 'list',
    calYear: 2026,
    calMonth: 6,
    calendarDays: [],
    periodStartDay: 19,
    periodLength: 5,
  },

  onLoad() {
    this.loadRecords();
    this.renderCalendar();
  },

  onShow() {
    this.loadRecords();
  },

  async loadRecords() {
    const user = userStore.toJSON ? userStore.toJSON() : {};
    const records = await getPainRecords(user.openid);
    this.setData({
      records: (records || []).map((r) => ({
        ...r,
        intensityClass: this._getIntensityClass(r.painIntensity),
        periodText: r.periodDay ? `· 经期第${r.periodDay}天` : '· 非经期',
      })),
    }, () => {
      this.renderCalendar();
    });
  },

  _getIntensityClass(intensity) {
    if (intensity <= 3) return 'intensity-low';
    if (intensity <= 6) return 'intensity-mid';
    return 'intensity-high';
  },

  onCanvasTap(e) {
    const { x, y } = e.detail;
    const query = wx.createSelectorQuery().in(this);
    query.select('#bodyMapCanvas').boundingClientRect((rect) => {
      const scaleX = 200 / rect.width;
      const scaleY = 267 / rect.height;
      const canvasX = x * scaleX;
      const canvasY = y * scaleY;
      const zone = this._detectZone(canvasX, canvasY);
      const label = zone ? zone.label : '自定义位置';
      const intensity = this.data.painIntensity <= 3 ? 'mild' : this.data.painIntensity <= 6 ? 'moderate' : 'severe';
      const painDots = this.data.painDots.slice();
      painDots.push({
        x: canvasX,
        y: canvasY,
        intensity,
        intensityClass: this._getIntensityClass(this.data.painIntensity),
        intensityText: this.data.intensityOptions[['mild', 'moderate', 'severe'].indexOf(intensity)],
        zone: zone ? zone.name : 'custom',
        label,
      });
      this.setData({ painDots });
    }).exec();
  },

  _detectZone(x, y) {
    let minDist = Infinity;
    let matched = null;
    ZONES.forEach((z) => {
      const dist = Math.sqrt(Math.pow(z.center.x - x, 2) + Math.pow(z.center.y - y, 2));
      if (dist < minDist) {
        minDist = dist;
        matched = z;
      }
    });
    return minDist < 25 ? matched : null;
  },

  clearPainDots() {
    this.setData({ painDots: [] });
  },

  removeDot(e) {
    const idx = e.currentTarget.dataset.index;
    const painDots = this.data.painDots.slice();
    painDots.splice(idx, 1);
    this.setData({ painDots });
  },

  onIntensitySliderChange(e) {
    this.setData({ painIntensity: e.detail.value });
  },

  onIntensityChange(e) {
    const idx = e.currentTarget.dataset.index;
    const val = e.detail.value;
    const intensityMap = ['mild', 'moderate', 'severe'];
    const painDots = this.data.painDots.slice();
    const intensity = intensityMap[val];
    painDots[idx].intensity = intensity;
    painDots[idx].intensityText = this.data.intensityOptions[val];
    painDots[idx].intensityClass = this._getIntensityClass(val * 3);
    this.setData({ painDots });
  },

  selectPainType(e) {
    this.setData({ painType: e.currentTarget.dataset.type });
  },

  toggleSymptom(e) {
    const symptom = e.currentTarget.dataset.symptom;
    const symptoms = this.data.symptoms.slice();
    const idx = symptoms.indexOf(symptom);
    if (idx > -1) symptoms.splice(idx, 1);
    else symptoms.push(symptom);
    this.setData({ symptoms });
  },

  selectScene(e) {
    this.setData({ scene: e.currentTarget.dataset.scene });
  },

  async saveRecord() {
    if (this.data.painDots.length === 0) {
      wx.showToast({ title: '请先在人体图上标记疼痛位置', icon: 'none' });
      return;
    }
    const sceneObj = this.data.sceneOptions.find((s) => s.value === this.data.scene);
    const record = {
      painIntensity: this.data.painIntensity,
      painType: this.data.painType,
      painLocations: this.data.painDots.map((d) => ({ x: d.x, y: d.y, intensity: d.intensity, zone: d.zone, label: d.label })),
      symptoms: this.data.symptoms,
      scene: this.data.scene,
      sceneLabel: sceneObj ? sceneObj.label : '居家',
      periodDay: userStore.periodDay || null,
      cyclePhase: userStore.cyclePhase || 'menstrual',
    };
    await createPainRecord(record);
    wx.showToast({ title: '记录已保存', icon: 'success' });
    this.setData({
      painDots: [],
      painIntensity: 5,
      painType: '绞痛',
      symptoms: [],
      scene: 'home',
    });
    this.loadRecords();
  },

  switchView(e) {
    this.setData({ recordView: e.currentTarget.dataset.view });
  },

  renderCalendar() {
    const days = [];
    const year = this.data.calYear;
    const month = this.data.calMonth;
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const records = this.data.records || [];

    for (let i = 0; i < firstDay; i++) {
      days.push({ key: `e${i}`, empty: true });
    }

    const periodStart = this.data.periodStartDay;
    const periodEnd = periodStart + this.data.periodLength - 1;

    const recordMap = {};
    records.forEach((r) => {
      const date = new Date(r.createdAt || Date.now());
      const day = date.getDate();
      if (!recordMap[day]) recordMap[day] = [];
      recordMap[day].push(r);
    });

    for (let d = 1; d <= totalDays; d++) {
      const isPeriod = d >= periodStart && d <= periodEnd;
      const rcds = recordMap[d] || [];
      const maxIntensity = rcds.length > 0 ? Math.max(...rcds.map((r) => r.painIntensity)) : 0;
      days.push({
        key: `d${d}`,
        day: d,
        empty: false,
        isPeriod,
        periodDay: isPeriod ? d - periodStart + 1 : null,
        painIntensity: maxIntensity,
        painLevelClass: maxIntensity <= 3 ? 'low' : maxIntensity <= 6 ? 'mid' : 'high',
        isToday: year === today.getFullYear() && month === today.getMonth() && d === today.getDate(),
        hasRecord: rcds.length > 0,
      });
    }
    this.setData({ calendarDays: days });
  },

  calPrevMonth() {
    if (this.data.calMonth === 0) {
      this.setData({ calYear: this.data.calYear - 1, calMonth: 11 }, () => this.renderCalendar());
    } else {
      this.setData({ calMonth: this.data.calMonth - 1 }, () => this.renderCalendar());
    }
  },

  calNextMonth() {
    if (this.data.calMonth === 11) {
      this.setData({ calYear: this.data.calYear + 1, calMonth: 0 }, () => this.renderCalendar());
    } else {
      this.setData({ calMonth: this.data.calMonth + 1 }, () => this.renderCalendar());
    }
  },

  onDayClick(e) {
    const day = e.currentTarget.dataset.day;
    if (day.empty) return;
    wx.showToast({ title: `${this.data.calMonth + 1}月${day.day}日`, icon: 'none' });
  },
});

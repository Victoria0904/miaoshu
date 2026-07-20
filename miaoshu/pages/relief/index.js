import { userStore } from '../../store/index';
import { generateReliefPlan } from '../../services/ai-relief';
import { SCENES } from '../../utils/constants';

Page({
  data: {
    step: 'scene',
    sceneOptions: SCENES,
    selectedScene: '',
    sceneLabel: '',
    painIntensity: 5,
    painType: '绞痛',
    constitutionTag: '宫寒',
    intensityClass: 'intensity-mid',
    generating: false,
    reliefPlan: {
      totalMinutes: 0,
      actions: [],
      avoidItems: [],
      timeSummary: '',
    },
  },

  onLoad(options) {
    const intensity = options.intensity ? parseInt(options.intensity, 10) : 5;
    this.setData({
      painIntensity: intensity,
      constitutionTag: userStore.constitutionTag || '宫寒',
      intensityClass: this._getIntensityClass(intensity),
    });
  },

  _getIntensityClass(intensity) {
    if (intensity <= 3) return 'intensity-low';
    if (intensity <= 6) return 'intensity-mid';
    return 'intensity-high';
  },

  selectScene(e) {
    const scene = e.currentTarget.dataset.scene;
    const found = this.data.sceneOptions.find((s) => s.value === scene);
    this.setData({ selectedScene: scene, sceneLabel: found ? found.label : '' });
  },

  async generatePlan() {
    if (!this.data.selectedScene) return;
    this.setData({ step: 'generating', generating: true });
    try {
      const plan = await generateReliefPlan({
        intensity: this.data.painIntensity,
        painType: this.data.painType,
        scene: this.data.selectedScene,
        constitution: this.data.constitutionTag,
      });
      this.setData({
        step: 'result',
        generating: false,
        reliefPlan: plan,
      });
    } catch (e) {
      this.setData({ step: 'scene', generating: false });
      wx.showToast({ title: '生成失败，请重试', icon: 'none' });
    }
  },

  finishRelief() {
    wx.switchTab({ url: '/pages/record/index' });
  },
});

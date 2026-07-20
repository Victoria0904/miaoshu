Component({
  properties: {
    min: { type: Number, value: 0 },
    max: { type: Number, value: 10 },
    step: { type: Number, value: 1 },
    value: { type: Number, value: 5 },
    activeColor: { type: String, value: '#E8919C' },
    backgroundColor: { type: String, value: '#F5DDE2' },
  },

  data: {
    intensityClass: 'intensity-mid',
    desc: '中度 · 影响生活',
  },

  lifetimes: {
    attached() {
      this.updateStyle(this.data.value);
    },
  },

  observers: {
    'value': function (val) {
      this.updateStyle(val);
    },
  },

  methods: {
    onChange(e) {
      const val = e.detail.value;
      this.updateStyle(val);
      this.triggerEvent('change', { value: val });
    },

    updateStyle(val) {
      let intensityClass = 'intensity-mid';
      let desc = '中度 · 影响生活';
      if (val <= 3) {
        intensityClass = 'intensity-low';
        desc = '轻度 · 可忍受';
      } else if (val >= 7) {
        intensityClass = 'intensity-high';
        desc = '重度 · 难以忍受';
      }
      this.setData({ intensityClass, desc });
    },
  },
});

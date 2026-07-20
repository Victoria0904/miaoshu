import { observable, action } from 'mobx-miniprogram';
import { getStorage, setStorage } from '../utils/storage';
import { mockUser } from '../services/mock-data';

// 用户状态
export const userStore = observable({
  isGuest: true,
  openid: '',
  nickname: '喵舒用户',
  avatarUrl: '',
  ageRange: '26-35',
  constitutionTag: '宫寒',
  cycleLength: 28,
  periodLength: 5,
  lastPeriodDate: '2026-07-19',
  periodDay: 2,
  cyclePhase: 'menstrual',

  setIsGuest: action(function (val) {
    this.isGuest = val;
  }),

  setUserInfo: action(function (info) {
    this.nickname = info.nickname || this.nickname;
    this.avatarUrl = info.avatarUrl || this.avatarUrl;
    this.ageRange = info.ageRange || this.ageRange;
    this.constitutionTag = info.constitutionTag || this.constitutionTag;
    this.cycleLength = info.cycleLength || this.cycleLength;
    this.periodLength = info.periodLength || this.periodLength;
    this.lastPeriodDate = info.lastPeriodDate || this.lastPeriodDate;
    this.openid = info.openid || this.openid;
    this.isGuest = false;
    setStorage('user_info', this.toJSON());
  }),

  loadFromStorage: action(function () {
    const info = getStorage('user_info');
    if (info) {
      Object.assign(this, info);
    }
  }),

  toJSON() {
    return {
      isGuest: this.isGuest,
      openid: this.openid,
      nickname: this.nickname,
      avatarUrl: this.avatarUrl,
      ageRange: this.ageRange,
      constitutionTag: this.constitutionTag,
      cycleLength: this.cycleLength,
      periodLength: this.periodLength,
      lastPeriodDate: this.lastPeriodDate,
      periodDay: this.periodDay,
      cyclePhase: this.cyclePhase,
    };
  },
});

// 疼痛记录状态
export const painRecordStore = observable({
  records: [],
  currentRecord: null,

  setRecords: action(function (records) {
    this.records = records;
  }),

  addRecord: action(function (record) {
    this.records.unshift(record);
    setStorage('pain_records_local', this.records);
  }),

  loadFromStorage: action(function () {
    const data = getStorage('pain_records_local') || [];
    this.records = data;
  }),

  setCurrentRecord: action(function (record) {
    this.currentRecord = record;
  }),
});

// UI 状态
export const uiStore = observable({
  currentTab: 'home',
  showReliefModal: false,
  showPrivacyModal: false,

  setCurrentTab: action(function (tab) {
    this.currentTab = tab;
  }),

  setShowReliefModal: action(function (val) {
    this.showReliefModal = val;
  }),

  setShowPrivacyModal: action(function (val) {
    this.showPrivacyModal = val;
  }),
});

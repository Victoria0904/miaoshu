/**
 * Mock 数据管理
 * 开发阶段使用，上线前将 USE_MOCK 改为 false
 */

import { formatDateTime } from '../utils/format';

export const USE_MOCK = true;

export function initMockData() {}

export const mockUser = {
  openid: 'mock_openid_001',
  nickname: 'Victoria',
  avatarUrl: '',
  ageRange: '26-35',
  constitutionTag: '宫寒',
  cycleLength: 28,
  periodLength: 5,
  lastPeriodDate: '2026-07-19',
  periodDay: 2,
  cyclePhase: 'menstrual',
};

export const mockPainRecords = [
  {
    id: 'r1',
    userId: 'mock_openid_001',
    painIntensity: 8,
    painType: '绞痛',
    painLocations: [{ x: 0.5, y: 0.5, intensity: 'severe', zone: 'uterus', label: '子宫区' }],
    symptoms: ['恶心', '冷汗', '腰酸'],
    scene: 'home',
    sceneLabel: '居家',
    periodDay: 1,
    cyclePhase: 'menstrual',
    dateText: '2026-07-19 09:30',
    createdAt: new Date('2026-07-19T09:30:00').toISOString(),
  },
  {
    id: 'r2',
    userId: 'mock_openid_001',
    painIntensity: 5,
    painType: '坠痛',
    painLocations: [{ x: 0.5, y: 0.6, intensity: 'moderate', zone: 'pelvic', label: '盆腔区' }],
    symptoms: ['乏力', '情绪低落'],
    scene: 'office',
    sceneLabel: '办公室',
    periodDay: 2,
    cyclePhase: 'menstrual',
    dateText: '2026-07-19 14:00',
    createdAt: new Date('2026-07-19T14:00:00').toISOString(),
  },
  {
    id: 'r3',
    userId: 'mock_openid_001',
    painIntensity: 4,
    painType: '隐痛',
    painLocations: [{ x: 0.3, y: 0.7, intensity: 'mild', zone: 'lumbar', label: '腰部' }],
    symptoms: ['腰酸'],
    scene: 'home',
    sceneLabel: '居家',
    periodDay: null,
    cyclePhase: 'luteal',
    dateText: '2026-07-15 20:00',
    createdAt: new Date('2026-07-15T20:00:00').toISOString(),
  },
  {
    id: 'r4',
    userId: 'mock_openid_001',
    painIntensity: 7,
    painType: '绞痛',
    painLocations: [{ x: 0.5, y: 0.5, intensity: 'severe', zone: 'uterus', label: '子宫区' }],
    symptoms: ['恶心', '呕吐', '腹泻'],
    scene: 'home',
    sceneLabel: '居家',
    periodDay: 1,
    cyclePhase: 'menstrual',
    dateText: '2026-06-21 10:00',
    createdAt: new Date('2026-06-21T10:00:00').toISOString(),
  },
  {
    id: 'r5',
    userId: 'mock_openid_001',
    painIntensity: 6,
    painType: '坠痛',
    painLocations: [{ x: 0.5, y: 0.6, intensity: 'moderate', zone: 'pelvic', label: '盆腔区' }],
    symptoms: ['头晕', '乏力'],
    scene: 'office',
    sceneLabel: '办公室',
    periodDay: 2,
    cyclePhase: 'menstrual',
    dateText: '2026-06-22 11:00',
    createdAt: new Date('2026-06-22T11:00:00').toISOString(),
  },
];

export const mockReviewData = {
  month: '2026-07',
  stolenBeautyHours: 12.5,
  avgIntensity: 6.8,
  painCount: 5,
  trendUp: true,
  trendDelta: '+1.2',
  aiSuggestions: [
    '你的疼痛峰值通常在经期第 1-2 天上午，建议提前 1 天晚上减少安排，把重要工作挪到疼痛缓解后。',
    '近 3 个月疼痛强度持续上升（4.2→6.8→7.5），建议关注并就医咨询，获取专业评估。',
    '非经期盆腔痛出现 3 次，记录关联显示与情绪波动有关，建议关注情绪管理。',
  ],
  timeBreakdown: [
    { key: 'survival', name: '生存时间', icon: '💤', hours: 28, percent: 37, color: '#A0C4FF' },
    { key: 'earning', name: '赚钱时间', icon: '💼', hours: 22, percent: 29, color: '#B9FBC0' },
    { key: 'beauty', name: '好看时间', icon: '', hours: 11, percent: 15, color: '#E8919C' },
    { key: 'fun', name: '好玩时间', icon: '🎮', hours: 8, percent: 11, color: '#FFD6A5' },
    { key: 'flow', name: '心流时间', icon: '', hours: 5, percent: 8, color: '#C5A3FF' },
  ],
  trendData: [3.8, 4.2, 4.5, 5.1, 6.8, 7.5],
  trendLabels: ['2月', '3月', '4月', '5月', '6月', '7月'],
};

export const mockMedicalReport = {
  chiefComplaint: '进行性加重痛经 6 个月，经期疼痛强度 7-8 分，伴非经期盆腔隐痛 3 次。',
  historySummary: '近 6 个月疼痛强度从 4.2 分上升至 7.5 分，呈进行性加重趋势。经期第 1-2 天为疼痛高峰，伴恶心、冷汗、腰酸。非经期出现 3 次盆腔隐痛，强度 3-4 分。',
  medications: [
    { name: '布洛芬', dosage: '400mg', frequency: '经期每日 2 次' },
    { name: '红糖姜茶', dosage: '1 杯', frequency: '经期每日 1 次' },
  ],
  questions: [
    '我的疼痛是否呈进行性加重趋势？需要进一步排查吗？',
    '非经期盆腔痛是否与经期痛有关联？',
    '目前用药方案是否需要调整？',
    '日常生活中还有哪些需要注意的触发因素？',
  ],
  alertText: '疼痛强度 3 个月内从 4.2→7.5，呈进行性加重；非经期盆腔痛出现 3 次。建议关注并就医咨询，按医生指导进行相关检查。',
  trendData: [3.8, 4.2, 4.5, 5.1, 6.8, 7.5],
  trendLabels: ['2月', '3月', '4月', '5月', '6月', '7月'],
};

export const mockReliefPlans = {
  home: {
    totalMinutes: 18,
    timeSummary: '完成全套方案约 18 分钟，帮你夺回今天 0.3 小时',
    actions: [
      { name: '腹部热敷', desc: '将暖宝宝或热水袋置于下腹部，温度适宜不烫皮肤', duration: 15, area: '腹部' },
      { name: '三阴交穴位按压', desc: '内踝尖上 4 横指处，拇指按压 30 秒/侧，交替进行', duration: 5, area: '腿部' },
      { name: '腹式呼吸法', desc: '仰卧或坐直，手放腹部，鼻吸气 4 秒→屏息 2 秒→口呼气 6 秒，重复 10 次', duration: 8, area: '全身' },
      { name: '婴儿式放松', desc: '跪坐，上身前倾趴在枕头上，手臂自然前伸，保持 3-5 分钟', duration: 5, area: '全身' },
      { name: '猫牛式伸展', desc: '四点跪姿，吸气塌腰抬头，呼气拱背低头，缓慢重复 8-10 次', duration: 5, area: '腰背' },
    ],
    avoidItems: ['避免冷饮和生冷食物', '避免剧烈运动和腹部受压', '避免空调直吹腹部'],
  },
  office: {
    totalMinutes: 15,
    timeSummary: '完成全套方案约 15 分钟，帮你夺回今天 0.25 小时',
    actions: [
      { name: '腹部热敷', desc: '使用可粘贴暖贴，隔着内衣贴于下腹部', duration: 15, area: '腹部' },
      { name: '工位体位调整', desc: '在椅子上放靠垫，微微前倾，减轻盆腔压力', duration: 2, area: '坐姿' },
      { name: '合谷穴按压', desc: '虎口处，拇指食指并拢时肌肉最高点，按压 1 分钟/手', duration: 3, area: '手部' },
      { name: '腹式呼吸法', desc: '鼻吸气 4 秒→屏息 2 秒→口呼气 6 秒，重复 10 次', duration: 8, area: '呼吸' },
    ],
    avoidItems: ['避免冷饮和生冷食物', '避免久坐不动', '避免穿露脐装'],
  },
  commute: {
    totalMinutes: 12,
    timeSummary: '完成全套方案约 12 分钟，帮你夺回今天 0.2 小时',
    actions: [
      { name: '坐姿前倾', desc: '坐在座位上微微前倾，用手轻压下腹部，减轻颠簸带来的疼痛加剧', duration: 3, area: '坐姿' },
      { name: '耳穴按压', desc: '耳廓中央「神门穴」，拇指按压 1 分钟，缓解疼痛和焦虑', duration: 2, area: '耳部' },
      { name: '深呼吸放松', desc: '用鼻子缓慢吸气 4 秒，屏息 2 秒，用嘴慢慢呼气 6 秒', duration: 8, area: '全身' },
    ],
    avoidItems: ['避免长时间站立', '避免穿紧身裤', '避免情绪激动'],
  },
  travel: {
    totalMinutes: 17,
    timeSummary: '完成全套方案约 17 分钟，帮你夺回今天 0.28 小时',
    actions: [
      { name: '暖贴随身', desc: '将暖贴贴在内衣靠近下腹部位置，持续发热 4-6 小时', duration: 1, area: '腹部' },
      { name: '足三里按压', desc: '膝盖外侧下方 4 横指处，拇指按压 2 分钟/侧', duration: 4, area: '腿部' },
      { name: '三阴交穴位按压', desc: '内踝尖上 4 横指处，拇指按压 30 秒/侧', duration: 5, area: '腿部' },
      { name: '腹式呼吸法', desc: '鼻吸气 4 秒→屏息 2 秒→口呼气 6 秒，重复 10 次', duration: 8, area: '全身' },
    ],
    avoidItems: ['避免冷饮和生冷食物', '避免过度劳累', '避免提重物'],
  },
};

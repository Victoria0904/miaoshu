/**
 * 常量定义
 */

export const PAIN_TYPES = ['钝痛', '刺痛', '绞痛', '坠痛', '隐痛', '灼烧痛'];

export const SYMPTOM_OPTIONS = ['恶心', '呕吐', '腹泻', '头晕', '乏力', '腰酸', '冷汗', '情绪低落'];

export const SCENES = [
  { value: 'home', label: '居家', icon: '🏠' },
  { value: 'office', label: '办公室', icon: '💼' },
  { value: 'commute', label: '通勤', icon: '🚇' },
  { value: 'travel', label: '出差', icon: '✈️' },
];

export const CONSTITUTION_TAGS = ['宫寒', '血瘀', '气滞', '气虚', '湿热', '痰湿'];

export const AGE_RANGES = [
  { value: '18-25', label: '18-25岁' },
  { value: '26-35', label: '26-35岁' },
  { value: '36-45', label: '36-45岁' },
  { value: '46+', label: '46岁以上' },
];

export const TIME_CATEGORIES = [
  { key: 'survival', name: '生存时间', icon: '💤', color: '#A0C4FF' },
  { key: 'earning', name: '赚钱时间', icon: '💼', color: '#B9FBC0' },
  { key: 'beauty', name: '好看时间', icon: '', color: '#E8919C' },
  { key: 'fun', name: '好玩时间', icon: '🎮', color: '#FFD6A5' },
  { key: 'flow', name: '心流时间', icon: '🧠', color: '#C5A3FF' },
];

export const PAIN_LEVELS = [
  { min: 0, max: 3, label: '轻度', color: '#67C23A', desc: '可忍受' },
  { min: 4, max: 6, label: '中度', color: '#F0A04B', desc: '影响生活' },
  { min: 7, max: 10, label: '重度', color: '#E65555', desc: '难以忍受' },
];

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER_INFO: 'user_info',
  PAIN_RECORDS: 'pain_records',
  SETTINGS: 'settings',
};

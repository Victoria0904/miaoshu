/**
 * 数据格式化工具
 */

import { PAIN_LEVELS, SCENES } from './constants';

/**
 * 根据疼痛强度获取等级信息
 * @param {number} intensity 0-10
 */
export function getPainLevel(intensity) {
  const level = PAIN_LEVELS.find((l) => intensity >= l.min && intensity <= l.max);
  return level || PAIN_LEVELS[PAIN_LEVELS.length - 1];
}

/**
 * 格式化日期为 yyyy-mm-dd
 * @param {Date|string} date
 */
export function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * 格式化日期时间
 * @param {Date|string} date
 */
export function formatDateTime(date) {
  const d = date instanceof Date ? date : new Date(date);
  return `${formatDate(d)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * 计算疼痛对好看时间的侵占
 * @param {number} intensity 0-10
 * @param {number} hours 持续小时数
 */
export function calcStolenBeautyHours(intensity, hours) {
  // 简化公式：强度系数 * 持续时间
  const factor = intensity / 10;
  return Math.round(hours * factor * 10) / 10;
}

/**
 * 根据场景值获取场景对象
 */
export function getSceneByValue(value) {
  return SCENES.find((s) => s.value === value);
}

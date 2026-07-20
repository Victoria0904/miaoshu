/**
 * 日期与周期计算工具
 */

/**
 * 获取当前日期所在月份的天数
 * @param {number} year
 * @param {number} month 0-11
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * 获取某月第一天是星期几
 * @param {number} year
 * @param {number} month 0-11
 */
export function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

/**
 * 判断是否为同一天
 */
export function isSameDay(d1, d2) {
  const a = d1 instanceof Date ? d1 : new Date(d1);
  const b = d2 instanceof Date ? d2 : new Date(d2);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * 计算两个日期相差的天数
 */
export function diffDays(d1, d2) {
  const a = new Date(d1).getTime();
  const b = new Date(d2).getTime();
  return Math.floor((a - b) / (1000 * 60 * 60 * 24));
}

/**
 * 根据经期开始日期和周期长度，推算当前处于经期第几天
 * @param {string|Date} startDate 经期开始日期
 * @param {number} periodLength 经期持续天数
 * @returns {number|null} 经期第几天，非经期返回 null
 */
export function getPeriodDay(startDate, periodLength = 5) {
  const start = new Date(startDate);
  const today = new Date();
  const days = diffDays(today, start);
  if (days >= 0 && days < periodLength) {
    return days + 1;
  }
  return null;
}

/**
 * 计算距离下次月经的天数
 * @param {string|Date} startDate 最近一次经期开始日期
 * @param {number} cycleLength 周期长度
 * @param {number} periodLength 经期持续天数
 */
export function getDaysToNextPeriod(startDate, cycleLength, periodLength) {
  const start = new Date(startDate);
  const today = new Date();
  const nextStart = new Date(start.getTime() + cycleLength * 24 * 60 * 60 * 1000);
  const days = diffDays(nextStart, today);
  return days >= 0 ? days : 0;
}

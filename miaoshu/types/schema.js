/**
 * 数据模型类型定义（JSDoc）
 */

/**
 * @typedef {Object} PainLocation
 * @property {number} x 0-1 归一化横坐标
 * @property {number} y 0-1 归一化纵坐标
 * @property {string} intensity 轻度/中度/重度
 * @property {string} zone 身体区域
 * @property {string} label 位置描述
 */

/**
 * @typedef {Object} PainRecord
 * @property {string} id
 * @property {string} userId
 * @property {number} painIntensity 0-10
 * @property {string} painType 钝痛/刺痛/绞痛等
 * @property {PainLocation[]} painLocations
 * @property {string[]} symptoms 伴随症状
 * @property {string} scene 场景
 * @property {string} sceneLabel 场景中文
 * @property {number|null} periodDay 经期第几天
 * @property {string} cyclePhase 周期阶段
 * @property {string} dateText 格式化日期
 * @property {string} createdAt ISO 时间
 */

/**
 * @typedef {Object} ReliefAction
 * @property {string} name 动作名称
 * @property {string} desc 动作说明
 * @property {number} duration 预计时长（分钟）
 * @property {string} area 作用部位
 */

/**
 * @typedef {Object} ReliefPlan
 * @property {number} totalMinutes 总时长
 * @property {ReliefAction[]} actions 动作列表
 * @property {string[]} avoidItems 避免事项
 * @property {string} timeSummary 时间汇总文案
 */

/**
 * @typedef {Object} TimeBreakdown
 * @property {string} key 时间类型
 * @property {string} name 显示名称
 * @property {string} icon 图标
 * @property {number} hours 小时数
 * @property {number} percent 百分比
 * @property {string} color 颜色
 */

/**
 * @typedef {Object} MonthlyReview
 * @property {string} month 月份
 * @property {number} stolenBeautyHours 被偷走的好看时间
 * @property {number} avgIntensity 平均疼痛强度
 * @property {number} painCount 疼痛发作次数
 * @property {TimeBreakdown[]} timeBreakdown 五种时间分布
 * @property {string[]} aiSuggestions AI 减损建议
 * @property {number[]} trendData 趋势数据
 * @property {string[]} trendLabels 趋势标签
 */

/**
 * @typedef {Object} MedicalReport
 * @property {string} chiefComplaint 主诉
 * @property {string} historySummary 现病史摘要
 * @property {Object[]} medications 用药记录
 * @property {string[]} questions 就医问题清单
 * @property {string} alertText 异常信号
 */

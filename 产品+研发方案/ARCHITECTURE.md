# 喵舒 · 技术架构文档

> **版本：** v1.0 | **日期：** 2026-07-20 | **适用场景：** MVP 24 小时交付 + 正式产品雏形

---

## 1. 技术栈选择及原因

### 1.1 架构总览

```
┌─────────────────────────────────────────────────┐
│              微信小程序（前端）                     │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌───┐│
│  │ 首页 │  │ 记录 │  │ 复盘 │  │ 就医 │  │我的││
│  └──┬───┘  └──┬───┘  └──┬───┘  └──┬───┘  └─┬─┘│
│  ┌──┴────────┴─────────┴─────────┴────────┴─┐ │
│  │          公共模块层（组件 / 工具 / API 封装）   │ │
│  └──────────────────┬─────────────────────────┘ │
└─────────────────────┼───────────────────────────┘
                      │
          ┌───────────┼───────────┐
          │           │           │
    ┌─────┴────┐ ┌────┴────┐ ┌───┴────┐
    │ Supabase │ │  AI API │ │ Storage │
    │PostgreSQL│ │GLM-5.2 │ │PDF 报告 │
    │  + Auth  │ │Kimi K2.7│ │用户资源 │
    │  + RLS   │ │         │ │         │
    └──────────┘ └─────────┘ └─────────┘
```

### 1.2 完整技术栈

| 层级 | 技术选型 | 版本/规格 | 选型理由 |
|------|---------|-----------|---------|
| **前端框架** | 微信小程序原生 | 基础库 3.x+ | 目标平台就是微信，原生开发最快；后续可迁移 Taro/uni-app |
| **前端语言** | JavaScript (ES2020+) | — | 小程序原生支持，无需编译；如需类型安全可加 JSDoc |
| **状态管理** | mobx-miniprogram | 最新稳定版 | 轻量响应式状态管理，比 EventBus 更结构化；MVP 可先用简化版 |
| **UI 组件库** | WeUI Mini Programs | 2.x | 微信官方组件库，开箱即用，符合微信设计规范 |
| **图表库** | ec-canvas（ECharts 微信小程序版） | 2.x | 支持环形图、折线图、柱状图；社区成熟，文档完善 |
| **人体图示** | 原生 Canvas 2D API | — | 不依赖第三方库，直接用 Canvas 绘制人体轮廓 + 触摸标记点位 |
| **请求封装** | wx.request + Promise 封装 | — | 小程序原生网络请求，封装成 async/await 风格 |
| **本地存储** | wx.setStorage / wx.getStorage | — | 小程序原生本地缓存，无需额外依赖 |
| **后端 BaaS** | Supabase | 最新云托管版 | 零运维：PostgreSQL + Auth + Realtime + Storage + Edge Functions 一站式 |
| **数据库** | PostgreSQL | Supabase 内置（v16） | 关系型数据库，JSONB 字段支持灵活存储疼痛点位/症状等半结构化数据 |
| **用户认证** | Supabase Auth + 微信登录 | — | wx.login → code → 后端换 openid → Supabase JWT；RLS 行级安全隔离用户数据 |
| **行级安全** | PostgreSQL RLS Policy | — | 每张表启用 RLS，用户只能 CRUD 自己的数据，数据库层保障隐私 |
| **AI 大模型** | GLM-5.2（智谱） | 1M 上下文、MIT 开源 | 国内合规首选；Claude Code drop-in 兼容；流式输出支持好 |
| **AI 备选** | Kimi K2.7 Code（月之暗面） | 256K 上下文 | 专注 coding/agent 场景；思考 token 用量较 K2.6 降 30%；可作为 fallback |
| **AI 调用方式** | 流式 SSE（Server-Sent Events） | — | 前端逐字展示方案，用户体验更好；GLM 和 Kimi 均支持 SSE |
| **Prompt 工程** | 结构化 System + User Prompt | — | System：角色设定+边界声明+中医知识库；User：JSON 格式症状数据 |
| **PDF 生成** | 服务端 Puppeteer | 最新版 | 小程序客户端无法生成 PDF；通过 Supabase Edge Function 调 Puppeteer |
| **文件存储** | Supabase Storage | — | PDF 报告、用户头像存储；自带 CDN 加速，RLS 控制访问权限 |
| **云函数** | Supabase Edge Functions | Deno 运行时 | 处理 AI API 中转（脱敏）、PDF 生成等需要服务端逻辑的场景 |
| **部署托管** | Supabase 云托管 | AWS 新加坡节点 | 国内访问延迟可接受（~150ms）；后续可迁移阿里云/腾讯云 |
| **环境管理** | .env + config.js | — | API key、Supabase URL、AI endpoint 统一管理；开发/生产环境分离 |
| **版本控制** | Git + GitHub | — | 标准 Git 工作流；.env 和密钥文件 .gitignore |
| **开发工具** | 微信开发者工具 | 最新稳定版 | 小程序开发、调试、预览、上传；内置模拟器和真机调试 |

### 1.3 核心架构决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 是否需要后端 | 需要，但用 BaaS 不自建 | Supabase 提供全套后端能力，零运维 |
| 是否需要数据库 | 需要 | 疼痛记录、用户数据、就医报告需要持久化 + 关系查询 |
| AI 调用方式 | 前端直调 API（SSE 流式） | MVP 阶段不做后端中转层；敏感数据脱敏后调用 |

---

## 2. 项目目录结构

```
miaoshu/
├── app.js                    # 小程序入口
├── app.json                  # 全局配置（tabBar、页面路由、权限）
├── app.wxss                  # 全局样式
├── sitemap.json
│
├── pages/                    # 页面
│   ├── home/                 # 首页（今日状态、指标卡、舒缓入口）
│   ├── record/               # 记录（疼痛记录表单、点位标记、历史列表）
│   ├── relief/               # AI 舒缓方案（场景选择→AI生成→方案展示）
│   ├── review/               # 复盘（月度生命力复盘、环形图、趋势曲线）
│   ├── report/               # 就医报告（预览、生成、PDF下载）
│   ├── profile/              # 我的（个人资料、设置）
│   └── auth/                 # 登录授权、隐私协议
│
├── components/               # 公共组件
│   ├── pain-slider/          # VAS 0-10 疼痛强度滑块
│   ├── body-map/             # 人体疼痛点位标记（Canvas）
│   ├── time-ring-chart/      # 五种时间环形图（ECharts 封装）
│   ├── trend-chart/          # 趋势曲线图
│   ├── ai-streaming/         # AI 流式输出展示组件
│   ├── empty-state/          # 空状态占位
│   └── privacy-modal/         # 隐私协议弹窗
│
├── services/                 # API 封装层（数据访问抽象）
│   ├── supabase.js           # Supabase 客户端初始化
│   ├── auth.js               # 微信登录 + Supabase Auth
│   ├── pain-record.js        # 疼痛记录 CRUD
│   ├── ai-relief.js          # AI 舒缓方案调用
│   ├── ai-report.js          # AI 就医报告生成
│   ├── review.js             # 生命力复盘数据聚合
│   └── mock-data.js          # Mock 数据（开发阶段用）
│
├── utils/                    # 工具函数
│   ├── storage.js            # 本地缓存封装
│   ├── date.js               # 日期处理（周期计算、格式化）
│   ├── format.js             # 数据格式化（疼痛等级→颜色、时间计算）
│   └── constants.js          # 常量定义（疼痛性质枚举、场景枚举等）
│
├── store/                    # 全局状态管理
│   └── index.js              # mobx-miniprogram 或简化 EventBus
│
├── styles/                   # 公共样式
│   ├── variables.wxss        # CSS 变量（主题色、间距、字体）
│   └── mixins.wxss           # 公共 mixin
│
├── assets/                   # 静态资源
│   ├── images/               # 图标、人体图示底图
│   └── icons/                # tabBar 图标
│
└── types/                    # 类型定义（JSDoc）
    └── schema.js             # 数据模型类型
```

**设计原则：**
- `services/` 是数据访问抽象层——页面不直接调 Supabase 或 AI API，统一走 service
- `services/mock-data.js` 在开发阶段替代真实 API，加速开发
- `components/` 只放可复用的 UI 组件，页面级组件放在 `pages/` 内
- `utils/` 只放纯函数，不涉及业务逻辑

---

## 3. 核心模块说明

### 3.1 模块依赖图

```
页面层         pages/*
               │
组件层         components/*
               │
服务层         services/*  ← 页面通过 service 访问数据
               │
工具层         utils/*     ← service 和组件共享工具函数
               │
基础设施       Supabase / AI API / Storage
```

### 3.2 各模块职责

| 模块 | 职责 | MVP 边界 |
|------|------|---------|
| **auth.js** | 微信登录 → 换 token → Supabase Auth | 首次进入强制登录 + 隐私协议 |
| **pain-record.js** | 疼痛记录的增删改查 | 只做"增"和"查"，不做编辑和删除 |
| **ai-relief.js** | 调 AI API 生成舒缓方案 | 流式输出，只生成不保存历史 |
| **ai-report.js** | 聚合数据 + AI 生成就医报告摘要 | 先做预览，PDF 下载用截图替代 |
| **review.js** | 聚合月度数据，计算五种时间 | 简化版：只算疼痛时间 + 好看时间，其他三种用默认值 |
| **storage.js** | 本地缓存（离线写入 + 云端同步队列） | 先做本地缓存，云端同步放第二阶段 |

### 3.3 页面列表

#### TabBar 页面（4 个一级页面）

| 页面 | 路径 | 核心功能 |
|------|------|---------|
| 首页 | `pages/home/index` | 今日状态、好看时间指标卡、快速记录入口、AI 舒缓入口 |
| 记录 | `pages/record/index` | 疼痛记录表单、人体点位标记、历史记录列表 |
| 复盘 | `pages/review/index` | 月度生命力复盘、五种时间环形图、趋势曲线 |
| 我的 | `pages/profile/index` | 个人资料、就医报告入口、设置、隐私协议 |

#### 二级页面（8 个）

| 页面 | 路径 | 说明 |
|------|------|------|
| 疼痛记录-点位标记 | `pages/record/body-map` | 人体图交互，点击标记疼痛位置 |
| 疼痛记录-表单 | `pages/record/form` | 强度滑块、疼痛性质、伴随症状、用药记录 |
| AI 舒缓方案 | `pages/relief/index` | 场景选择 → AI 生成方案 → 方案展示 |
| 就医报告-预览 | `pages/report/preview` | 结构化报告预览，选择时间范围 |
| 就医报告-生成 | `pages/report/generate` | AI 生成报告摘要 + PDF 下载 |
| 登录授权 | `pages/auth/login` | 微信一键登录 + 隐私协议弹窗 |
| 隐私协议 | `pages/auth/privacy` | 隐私政策全文 |
| 设置 | `pages/profile/settings` | 体质标签、经期信息、数据导出 |

---

## 4. 数据模型设计

### 4.1 数据库表结构（PostgreSQL / Supabase）

```sql
-- 用户表
CREATE TABLE profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  openid      TEXT UNIQUE NOT NULL,
  nickname    TEXT,
  avatar_url   TEXT,
  age_range   TEXT,                          -- '18-25' | '26-35' | '36-45' | '46+'
  constitution_tag TEXT,                    -- 中医体质标签（用户自选）
  cycle_length INT,                          -- 经期周期天数
  period_length INT,                         -- 经期持续天数
  last_period_date DATE,                     -- 最近一次经期开始日期
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 疼痛记录表（核心表）
CREATE TABLE pain_records (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id),
  pain_intensity  INT NOT NULL,               -- 0-10 VAS
  pain_type       TEXT,                       -- '钝痛'|'刺痛'|'绞痛'|'坠痛'|'灼烧痛'
  pain_locations  JSONB,                      -- [{x:0.3,y:0.4,intensity:'moderate'}, ...]
  duration_start  TIMESTAMPTZ,
  duration_end    TIMESTAMPTZ,
  symptoms        JSONB,                      -- ['恶心','呕吐','腹泻','头晕','乏力']
  triggers        JSONB,                      -- ['饮食','运动','情绪','天气']
  relief_methods  JSONB,                      -- ['热敷','休息','用药'] + 效果评级
  medications     JSONB,                      -- [{name,dosage,time,effect}]
  period_day      INT,                        -- 经期第几天（null = 非经期）
  cycle_phase     TEXT,                       -- 'menstrual'|'follicular'|'ovulation'|'luteal'
  ai_analysis     JSONB,                      -- AI 生成的关联分析结果
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- AI 舒缓方案记录表
CREATE TABLE relief_plans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id),
  pain_record_id UUID REFERENCES pain_records(id),
  scene       TEXT,                           -- 'office'|'home'|'commute'|'travel'
  plan_content JSONB,                         -- [{action,duration,difficulty,area}]
  avoid_items  JSONB,                         -- ['避免冷饮','避免剧烈运动']
  time_summary TEXT,                          -- "完成约需 X 分钟，夺回 Y 小时"
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 月度复盘表
CREATE TABLE monthly_reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id),
  month       DATE NOT NULL,
  pain_hours  DECIMAL(5,2),
  time_breakdown JSONB,                       -- {survival,earning,beauty,fun,flow}
  stolen_beauty_hours DECIMAL(5,2),
  ai_suggestion TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- 就医报告表
CREATE TABLE medical_reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id),
  date_range_start DATE,
  date_range_end   DATE,
  report_content JSONB,
  pdf_url        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 行级安全策略（RLS）— 每张表都要配置
ALTER TABLE pain_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "用户只能查看自己的疼痛记录" ON pain_records
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "用户只能创建自己的疼痛记录" ON pain_records
  FOR INSERT WITH CHECK (user_id = auth.uid());
-- profiles / relief_plans / monthly_reviews / medical_reports 同理配置 RLS
```

### 4.2 ER 图

```
profiles (1) ──────── (N) pain_records
    │                       │
    │                  (1) pain_records (1)
    │                       │
    │                  (N) relief_plans (N)
    │
    ├────── (N) monthly_reviews
    └────── (N) medical_reports
```

### 4.3 数据同步策略

| 场景 | MVP 策略 | 后续优化 |
|------|---------|---------|
| 疼痛记录写入 | 先写本地缓存，立即展示；后台异步同步 Supabase | 加重试队列 + 冲突合并 |
| 数据读取 | 先读本地缓存，无缓存再查 Supabase | 加增量同步 + 预加载 |
| 离线场景 | 疼痛记录可离线写入，AI 舒缓需在线 | 本地规则引擎兜底 |
| 多端同步 | MVP 不处理（单端使用） | 最后写入优先 + 合并 |

---

## 5. 代码规范

### 5.1 文件命名

- 页面目录：`kebab-case`（`body-map`、`pain-record`）
- JS 文件：`camelCase`（`painRecord.js`、`aiRelief.js`）
- 组件目录：`kebab-case`（`pain-slider`、`time-ring-chart`）
- 常量：`UPPER_SNAKE_CASE`

### 5.2 页面 JS 结构

```javascript
Page({
  data: {},           // 响应式数据
  onLoad() {},        // 生命周期
  // ── 事件处理 ──
  handleXxx() {},
  // ── 私有方法（下划线前缀）──
  _formatXxx() {},
});
```

### 5.3 关键约定

| 规范 | 说明 |
|------|------|
| **不直接调 API** | 页面不直接调 Supabase 或 AI API，统一走 `services/` |
| **疼痛强度统一用 0-10 整数** | 存储 int，展示时映射颜色和文案 |
| **时间统一用 ISO 8601** | 存 TIMESTAMPTZ，展示时格式化 |
| **疼痛点位用归一化坐标** | 存 0-1 的 x/y，适配不同屏幕尺寸 |
| **AI 输出必须解析为 JSON** | 不直接展示 raw text，解析后渲染卡片 |
| **免责声明常驻** | 每个涉及 AI 建议的页面底部都有"AI 建议非医疗诊断" |
| **敏感数据不进 prompt** | 调 AI 前脱敏：不传用户名、手机号 |

### 5.4 主题色

```css
page {
  --color-primary: #E8919C;        /* 暖粉，温柔不刺眼 */
  --color-primary-light: #F5DDE2;
  --color-danger: #E65555;          /* 剧烈疼痛预警 */
  --color-warning: #F0A04B;        /* 中度疼痛 */
  --color-success: #67C23A;        /* 缓解有效 */
  --color-bg: #FAF8F5;             /* 米白背景，护眼 */
  --color-text: #333333;
  --color-text-secondary: #999999;
  --spacing-unit: 8rpx;            /* 8rpx 基准间距 */
}
```

### 5.5 Mock 数据管理

```javascript
// services/mock-data.js
const USE_MOCK = true;  // 开发阶段开关，上线前改为 false

export async function getPainRecords(userId) {
  if (USE_MOCK) {
    return mockPainRecords;
  }
  return await supabase.from('pain_records').select('*').eq('user_id', userId);
}
```

所有 service 函数统一 `USE_MOCK` 开关，切换时不需要改任何页面代码。

| 模块 | Mock 策略 | 切换时机 |
|------|---------|---------|
| 疼痛记录历史 | 预置 3 条模拟记录 | Supabase 表建好后 |
| 生命力复盘 | 预置 1 个月模拟数据 | 用户积累 1 个月数据后 |
| AI 舒缓方案 | 预置 1 套静态方案 JSON | AI API key 配置后 |
| 就医报告 | 预置 1 份模拟报告 | AI 报告生成完成后 |
| 用户登录 | 跳过登录，注入 mock user_id | Supabase Auth 对接后 |

---

## 6. 扩展性预留

| 扩展方向 | 预留方式 | MVP 不做的理由 |
|---------|---------|---------|
| 社区功能 | `profiles` 表已预留扩展空间 | MVP 不需要 |
| 可穿戴设备 | `pain_records.ai_analysis` JSONB 可扩展 | MVP 不需要 |
| 多语言 | 样式层用 CSS 变量，文案集中管理 | 初期仅中文 |
| AI 模型切换 | `services/ai-relief.js` 抽象调用层 | 先用一家 |
| 跨平台迁移 | 原生小程序结构清晰，后续可迁移 Taro | MVP 先跑通微信 |

---

> 完整架构方案（含数据流图、AI 调用流程、24 小时开发节奏等）见 [开发方案/喵舒-技术架构方案-MVP.md](开发方案/喵舒-技术架构方案-MVP.md)

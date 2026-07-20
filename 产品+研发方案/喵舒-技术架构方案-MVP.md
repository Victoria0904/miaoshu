# 喵舒 · 技术架构方案（MVP）

> **版本：** v1.0
> **日期：** 2026-07-20
> **适用场景：** 黑客松 24 小时交付 + 正式产品雏形
> **原则：** 刚刚好——满足当前需求，有一定扩展空间，不为可能永远用不到的功能增加复杂度

---

## 一、架构总览

```
┌─────────────────────────────────────────────────┐
│              微信小程序（前端）                     │
│                                                 │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌───┐│
│  │ 首页 │  │ 记录 │  │ 复盘 │  │ 就医 │  │我的││
│  │      │  │      │  │      │  │ 报告 │  │   ││
│  └──┬───┘  └──┬───┘  └──┬───┘  └──┬───┘  └─┬─┘│
│     │         │         │         │        │   │
│  ┌──┴────────┴─────────┴─────────┴────────┴─┐ │
│  │          公共模块层（组件 / 工具 / API 封装）   │ │
│  └──────────────────┬─────────────────────────┘ │
└─────────────────────┼───────────────────────────┘
                      │
          ┌───────────┼───────────┐
          │           │           │
    ┌─────┴────┐ ┌────┴────┐ ┌───┴────┐
    │ Supabase │ │  AI API │ │ Storage │
    │          │ │         │ │         │
    │PostgreSQL│ │GLM-5.2 │ │PDF 报告 │
    │  + Auth  │ │Kimi K2.7│ │用户资源 │
    │  + RLS   │ │         │ │         │
    └──────────┘ └─────────┘ └─────────┘
```

**核心决策：**

| 决策      | 选择                 | 理由                                                            |
| ------- | ------------------ | ------------------------------------------------------------- |
| 是否需要后端  | **需要，但用 BaaS 不自建** | Supabase 提供 PostgreSQL + Auth + API + Storage + RLS（行级安全），零运维 |
| 是否需要数据库 | **需要**             | 疼痛记录、用户数据、就医报告需要持久化 + 关系查询                                    |
| 前端框架    | **微信小程序原生**        | 目标平台就是微信，原生最快；后续可迁移 Taro                                      |
| AI 调用   | **前端直调 API**       | MVP 阶段不做后端中转层，前端通过云函数或直接调 AI API                              |

### 1.1 完整技术栈

- **前端**：小程序原生、JS ES2020、mobx-miniprogram、WeUI、ec-canvas、Canvas 2D、wx.request 封装、wx.setStorage
- **后端**：Supabase（PostgreSQL v16 + Auth + RLS + Storage + Edge Functions）
- **AI**：GLM-5.2（首推，1M 上下文 MIT 开源）、Kimi K2.7 Code（备选）、SSE 流式调用、结构化 Prompt 工程
- **基础设施**：Puppeteer PDF 生成、Supabase Storage 文件存储、AWS 新加坡节点部署、.env 环境管理、Git 版本控制、微信开发者工具

| 层级            | 技术选型                          | 版本/规格            | 选型理由                                                            |
| ------------- | ----------------------------- | ---------------- | --------------------------------------------------------------- |
| **前端框架**      | 微信小程序原生                       | 基础库 3.x+         | 目标平台就是微信，原生开发最快；后续可迁移 Taro/uni-app                              |
| **前端语言**      | JavaScript (ES2020+)          | —                | 小程序原生支持，无需编译；如需类型安全可加 JSDoc                                     |
| **状态管理**      | mobx-miniprogram              | 最新稳定版            | 轻量响应式状态管理，比 EventBus 更结构化；MVP 可先用简化版                            |
| **UI 组件库**    | WeUI Mini Programs            | 2.x              | 微信官方组件库，开箱即用，符合微信设计规范                                           |
| **图表库**       | ec-canvas（ECharts 微信小程序版）     | 2.x              | 支持环形图、折线图、柱状图；社区成熟，文档完善                                         |
| **人体图示**      | 原生 Canvas 2D API              | —                | 不依赖第三方库，直接用 Canvas 绘制人体轮廓 + 触摸标记点位                              |
| **请求封装**      | wx.request + Promise 封装       | —                | 小程序原生网络请求，封装成 async/await 风格                                    |
| **本地存储**      | wx.setStorage / wx.getStorage | —                | 小程序原生本地缓存，无需额外依赖                                                |
| **后端 BaaS**   | Supabase                      | 最新云托管版           | 零运维：PostgreSQL + Auth + Realtime + Storage + Edge Functions 一站式 |
| **数据库**       | PostgreSQL                    | Supabase 内置（v16） | 关系型数据库，JSONB 字段支持灵活存储疼痛点位/症状等半结构化数据                             |
| **用户认证**      | Supabase Auth + 微信登录          | —                | wx.login → code → 后端换 openid → Supabase JWT；RLS 行级安全隔离用户数据      |
| **行级安全**      | PostgreSQL RLS Policy         | —                | 每张表启用 RLS，用户只能 CRUD 自己的数据，数据库层保障隐私                              |
| **AI 大模型**    | GLM-5.2（智谱）                   | 1M 上下文、MIT 开源    | 国内合规首选；Claude Code drop-in 兼容；流式输出支持好                           |
| **AI 备选**     | Kimi K2.7 Code（月之暗面）          | 256K 上下文         | 专注 coding/agent 场景；思考 token 用量较 K2.6 降 30%；可作为 fallback         |
| **AI 调用方式**   | 流式 SSE（Server-Sent Events）    | —                | 前端逐字展示方案，用户体验更好；GLM 和 Kimi 均支持 SSE                              |
| **Prompt 工程** | 结构化 System + User Prompt      | —                | System：角色设定+边界声明+中医知识库；User：JSON 格式症状数据                         |
| **PDF 生成**    | 服务端 Puppeteer                 | 最新版              | 小程序客户端无法生成 PDF；通过 Supabase Edge Function 调 Puppeteer            |
| **文件存储**      | Supabase Storage              | —                | PDF 报告、用户头像存储；自带 CDN 加速，RLS 控制访问权限                              |
| **云函数**       | Supabase Edge Functions       | Deno 运行时         | 处理 AI API 中转（脱敏）、PDF 生成等需要服务端逻辑的场景                              |
| **部署托管**      | Supabase 云托管                  | AWS 新加坡节点        | 国内访问延迟可接受（\~150ms）；后续可迁移阿里云/腾讯云                                 |
| **环境管理**      | .env + config.js              | —                | API key、Supabase URL、AI endpoint 统一管理；开发/生产环境分离                 |
| **版本控制**      | Git + GitHub                  | —                | 标准 Git 工作流；.env 和密钥文件 .gitignore                                |
| **开发工具**      | 微信开发者工具                       | 最新稳定版            | 小程序开发、调试、预览、上传；内置模拟器和真机调试                                       |

**技术栈依赖关系图：**

```
微信小程序（前端）
  ├── ec-canvas（图表）
  ├── WeUI（UI 组件）
  ├── mobx-miniprogram（状态管理）
  └── Canvas 2D（人体图示）
        │
        ├── wx.request ──► Supabase（BaaS）
        │                    ├── PostgreSQL + RLS（数据）
        │                    ├── Auth（微信登录）
        │                    ├── Storage（文件）
        │                    └── Edge Functions（PDF 生成）
        │
        └── SSE 流式 ──► AI API
                          ├── GLM-5.2（首推）
                          └── Kimi K2.7 Code（备选）
```

---

## 二、页面列表

### 2.1 TabBar 页面（4 个一级页面）

| 页面     | 路径                    | 核心功能                        | 对应 PRD 功能                |
| ------ | --------------------- | --------------------------- | ------------------------ |
| **首页** | `pages/home/index`    | 今日状态、好看时间指标卡、快速记录入口、AI 舒缓入口 | F3 AI 舒缓（入口）+ F4 复盘（指标卡） |
| **记录** | `pages/record/index`  | 疼痛记录表单、人体点位标记、历史记录列表        | F1 疼痛记录 + F2 疼痛评估        |
| **复盘** | `pages/review/index`  | 月度生命力复盘、五种时间环形图、趋势曲线        | F4 生命力复盘                 |
| **我的** | `pages/profile/index` | 个人资料、就医报告入口、设置、隐私协议         | F5 就医报告（入口）              |

### 2.2 二级页面

| 页面        | 路径                       | 说明                    |
| --------- | ------------------------ | --------------------- |
| 疼痛记录-点位标记 | `pages/record/body-map`  | 人体图交互，点击标记疼痛位置        |
| 疼痛记录-表单   | `pages/record/form`      | 强度滑块、疼痛性质、伴随症状、用药记录   |
| AI 舒缓方案   | `pages/relief/index`     | 场景选择 → AI 生成方案 → 方案展示 |
| 就医报告-预览   | `pages/report/preview`   | 结构化报告预览，选择时间范围        |
| 就医报告-生成   | `pages/report/generate`  | AI 生成报告摘要 + PDF 下载    |
| 登录授权      | `pages/auth/login`       | 微信一键登录 + 隐私协议弹窗       |
| 隐私协议      | `pages/auth/privacy`     | 隐私政策全文                |
| 设置        | `pages/profile/settings` | 体质标签、经期信息、数据导出        |

**合计：4 个 TabBar + 8 个二级 \= 12 个页面**

---

## 三、项目目录结构

```
miaoshu/
├── app.js                    # 小程序入口
├── app.json                  # 全局配置（tabBar、页面路由、权限）
├── app.wxss                  # 全局样式
├── sitemap.json
│
├── pages/                    # 页面（见第二节）
│   ├── home/
│   ├── record/
│   ├── relief/
│   ├── review/
│   ├── report/
│   ├── profile/
│   └── auth/
│
├── components/               # 公共组件
│   ├── pain-slider/          # VAS 0-10 疼痛强度滑块
│   ├── body-map/             # 人体疼痛点位标记（SVG/Canvas）
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
│   ├── storage.js            # 本地缓存（wx.setStorage 封装）
│   ├── date.js               # 日期处理（周期计算、格式化）
│   ├── format.js             # 数据格式化（疼痛等级→颜色、时间计算）
│   └── constants.js          # 常量定义（疼痛性质枚举、场景枚举等）
│
├── store/                    # 全局状态管理
│   └── index.js              # 轻量状态管理（EventBus 或 mobx-miniprogram）
│
├── styles/                   # 公共样式
│   ├── variables.wxss        # CSS 变量（主题色、间距、字体）
│   └── mixins.wxss           # 公共 mixin
│
├── assets/                   # 静态资源
│   ├── images/               # 图标、人体图示底图
│   └── icons/                # tabBar 图标
│
└── types/                    # 类型定义（JSDoc 或 TypeScript）
    └── schema.js             # 数据模型类型
```

**设计原则：**

- `services/` 是数据访问抽象层——页面不直接调 Supabase 或 AI API，统一走 service
- `services/mock-data.js` 在开发阶段替代真实 API，加速开发
- `components/` 只放可复用的 UI 组件，页面级组件放在 `pages/` 内
- `utils/` 只放纯函数，不涉及业务逻辑

---

## 四、核心模块划分

### 4.1 模块依赖图

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

### 4.2 各模块职责

| 模块                 | 职责                             | MVP 边界                     |
| ------------------ | ------------------------------ | -------------------------- |
| **auth.js**        | 微信登录 → 换 token → Supabase Auth | 首次进入强制登录 + 隐私协议            |
| **pain-record.js** | 疼痛记录的增删改查                      | 只做"增"和"查"，不做编辑和删除          |
| **ai-relief.js**   | 调 AI API 生成舒缓方案                | 流式输出，只生成不保存历史              |
| **ai-report.js**   | 聚合数据 + AI 生成就医报告摘要             | 先做预览，PDF 下载用截图替代           |
| **review.js**      | 聚合月度数据，计算五种时间                  | 简化版：只算疼痛时间 + 好看时间，其他三种用默认值 |
| **storage.js**     | 本地缓存（离线写入 + 云端同步队列）            | 先做本地缓存，云端同步放第二阶段           |

---

## 五、数据模型设计

### 5.1 数据库表结构（PostgreSQL / Supabase）

```sql
-- 用户表
CREATE TABLE profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  openid      TEXT UNIQUE NOT NULL,          -- 微信 openid
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
  
  -- 疼痛详情
  pain_intensity  INT NOT NULL,               -- 0-10 VAS
  pain_type       TEXT,                       -- '钝痛'|'刺痛'|'绞痛'|'坠痛'|'灼烧痛'
  pain_locations  JSONB,                      -- [{x:0.3,y:0.4,intensity:'moderate'}, ...]
  duration_start  TIMESTAMPTZ,
  duration_end    TIMESTAMPTZ,
  
  -- 伴随信息
  symptoms        JSONB,                      -- ['恶心','呕吐','腹泻','头晕','乏力'] 多选
  triggers        JSONB,                      -- ['饮食','运动','情绪','天气'] 可选填
  relief_methods  JSONB,                      -- ['热敷','休息','用药'] + 效果评级
  
  -- 用药记录
  medications     JSONB,                      -- [{name,dosage,time,effect}]
  
  -- 关联信息
  period_day      INT,                        -- 经期第几天（null = 非经期）
  cycle_phase     TEXT,                       -- 'menstrual'|'follicular'|'ovulation'|'luteal'
  
  -- AI 关联
  ai_analysis     JSONB,                      -- AI 生成的关联分析结果
  
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- AI 舒缓方案记录表
CREATE TABLE relief_plans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id),
  pain_record_id UUID REFERENCES pain_records(id),
  
  -- 输入
  scene       TEXT,                           -- 'office'|'home'|'commute'|'travel'
  
  -- 输出
  plan_content JSONB,                         -- [{action,duration,difficulty,area}]
  avoid_items  JSONB,                         -- ['避免冷饮','避免剧烈运动']
  time_summary TEXT,                          -- "完成约需 X 分钟，夺回 Y 小时"
  
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 月度复盘表
CREATE TABLE monthly_reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id),
  
  month       DATE NOT NULL,                  -- 2026-07-01
  pain_hours  DECIMAL(5,2),                   -- 本月疼痛总时长
  time_breakdown JSONB,                       -- {survival,earning,beauty,fun,flow} 各占比
  stolen_beauty_hours DECIMAL(5,2),           -- 被偷走的好看时间
  
  ai_suggestion TEXT,                         -- AI 减损建议
  
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- 就医报告表
CREATE TABLE medical_reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id),
  
  date_range_start DATE,
  date_range_end   DATE,
  
  report_content JSONB,                       -- 结构化报告内容
  pdf_url        TEXT,                        -- Storage 中 PDF 的 URL
  
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 行级安全策略（RLS）
ALTER TABLE pain_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "用户只能查看自己的疼痛记录" ON pain_records
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "用户只能创建自己的疼痛记录" ON pain_records
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 其他表同理配置 RLS
```

### 5.2 数据模型 ER 图

```
profiles (1) ──────── (N) pain_records
    │                       │
    │                       │
    │                  (1) pain_records (1)
    │                       │
    │                       │
    │                  (N) relief_plans (N)
    │
    │
    ├────── (N) monthly_reviews
    │
    └────── (N) medical_reports
```

### 5.3 前端数据模型（JS）

```javascript
// types/schema.js

/**
 * @typedef {Object} PainRecord
 * @property {string} id
 * @property {string} userId
 * @property {number} painIntensity        // 0-10
 * @property {string} painType             // '钝痛'|'刺痛'|'绞痛'|'坠痛'|'灼烧痛'
 * @property {PainLocation[]} painLocations
 * @property {Date} durationStart
 * @property {Date} durationEnd
 * @property {string[]} symptoms           // 伴随症状
 * @property {string[]} triggers           // 触发因素
 * @property {ReliefMethod[]} reliefMethods
 * @property {Medication[]} medications
 * @property {number|null} periodDay       // 经期第几天
 * @property {string} cyclePhase
 */

/**
 * @typedef {Object} PainLocation
 * @property {number} x                     // 0-1 归一化坐标
 * @property {number} y
 * @property {string} intensity             // 'mild'|'moderate'|'severe'
 */

/**
 * @typedef {Object} ReliefPlan
 * @property {string} scene                 // 'office'|'home'|'commute'|'travel'
 * @property {ReliefAction[]} actions
 * @property {string[]} avoidItems
 * @property {string} timeSummary
 */

/**
 * @typedef {Object} MonthlyReview
 * @property {Date} month
 * @property {number} painHours
 * @property {TimeBreakdown} timeBreakdown
 * @property {number} stolenBeautyHours
 * @property {string} aiSuggestion
 */
```

---

## 六、数据流

### 6.1 核心数据流：疼痛记录 → AI 舒缓 → 复盘

```
用户操作                    前端                     后端(Supabase)           AI API
   │                         │                         │                      │
   │  1. 标记疼痛点位         │                         │                      │
   │  2. 填写强度/症状        │                         │                      │
   │ ──────────────────────► │                         │                      │
   │                         │  3. 本地缓存             │                      │
   │                         │  (storage.js)           │                      │
   │                         │                         │                      │
   │  4. 点击"获取舒缓方案"    │                         │                      │
   │ ──────────────────────► │                         │                      │
   │                         │  5. 构造 prompt           │                      │
   │                         │ ──────────────────────────────────────────────► │
   │                         │                         │                      │
   │                         │  6. 流式返回方案          │                      │
   │                         │ ◄──────────────────────────────────────────────  │
   │                         │                         │                      │
   │  7. 展示方案卡片         │                         │                      │
   │ ◄────────────────────── │                         │                      │
   │                         │                         │                      │
   │                         │  8. 保存疼痛记录          │                      │
   │                         │ ──────────────────────► │                      │
   │                         │                         │  9. PostgreSQL 入库    │
   │                         │  10. 返回 record_id      │                      │
   │                         │ ◄──────────────────────  │                      │
   │                         │                         │                      │
   │  ... 月底触发复盘 ...      │                         │                      │
   │                         │  11. 查询月度记录         │                      │
   │                         │ ──────────────────────► │                      │
   │                         │  12. 返回记录集合          │                      │
   │                         │ ◄──────────────────────  │                      │
   │                         │  13. 计算五种时间          │                      │
   │                         │  (本地计算)              │                      │
   │  14. 展示环形图+趋势      │                         │                      │
   │ ◄────────────────────── │                         │                      │
```

### 6.2 数据同步策略

| 场景     | MVP 策略                      | 后续优化         |
| ------ | --------------------------- | ------------ |
| 疼痛记录写入 | 先写本地缓存，立即展示；后台异步同步 Supabase | 加重试队列 + 冲突合并 |
| 数据读取   | 先读本地缓存，无缓存再查 Supabase       | 加增量同步 + 预加载  |
| 离线场景   | 疼痛记录可离线写入，AI 舒缓需在线          | 本地规则引擎兜底     |
| 多端同步   | MVP 不处理（单端使用）               | 最后写入优先 + 合并  |

### 6.3 AI 调用数据流

```
用户输入
├── 疼痛位置 + 强度 + 性质
├── 场景选择
└── 体质标签（从 profile 读取）
        │
        ▼
   构造 prompt（services/ai-relief.js）
   ├── System prompt：角色设定 + 边界声明 + 中医知识库
   └── User prompt：结构化症状数据
        │
        ▼
   调用 AI API（GLM-5.2 / Kimi K2.7 Code）
   ├── 流式输出
   └── 前端逐字展示（components/ai-streaming）
        │
        ▼
   解析结构化 JSON（动作清单 + 避免事项 + 时间汇总）
        │
        ▼
   渲染方案卡片 + 一键保存到历史
```

---

## 七、哪些地方先用 Mock 数据

| 模块          | Mock 策略                          | 真实数据切换时机              |
| ----------- | -------------------------------- | --------------------- |
| **疼痛记录历史**  | 预置 3 条模拟记录（不同强度/位置/周期），验证列表和图表渲染 | Supabase 表建好后切换       |
| **生命力复盘**   | 预置 1 个月模拟数据（五种时间分布），验证环形图        | 用户积累 1 个月数据后切换        |
| **AI 舒缓方案** | 预置 1 套静态方案 JSON，验证 UI 渲染         | AI API key 配置后切换      |
| **就医报告**    | 预置 1 份模拟报告内容，验证预览页布局             | AI 报告生成功能完成后切换        |
| **AI 就医导航** | 预置 1 条静态预警文案，验证 UI               | 跨周期数据积累后切换            |
| **用户登录**    | 跳过登录，直接注入 mock user\_id          | Supabase Auth 对接完成后切换 |
| **经期预测**    | 不做预测，手动输入经期日期                    | 第二阶段                  |

**Mock 数据管理方式：**

```javascript
// services/mock-data.js
const USE_MOCK = true;  // 开发阶段开关

export async function getPainRecords(userId) {
  if (USE_MOCK) {
    return mockPainRecords;
  }
  return await supabase.from('pain_records').select('*').eq('user_id', userId);
}
```

**切换策略：** 所有 service 函数统一 `USE_MOCK` 开关，上线前改为 `false` 即可。不需要改任何页面代码。

---

## 八、代码规范建议

### 8.1 文件命名

- 页面目录：`kebab-case`（`body-map`、`pain-record`）
- JS 文件：`camelCase`（`painRecord.js`、`aiRelief.js`）
- 组件目录：`kebab-case`（`pain-slider`、`time-ring-chart`）
- 常量：`UPPER_SNAKE_CASE`

### 8.2 代码结构

```javascript
// 页面文件结构（每个页面 4 个文件）
pages/record/
├── index.js      // 逻辑
├── index.wxml    // 模板
├── index.wxss    // 样式
└── index.json    // 页面配置

// 页面 JS 结构
Page({
  data: {},           // 响应式数据
  onLoad() {},        // 生命周期
  // ── 事件处理 ──
  handleXxx() {},
  // ── 私有方法（下划线前缀）──
  _formatXxx() {},
});
```

### 8.3 关键约定

| 规范                  | 说明                                       |
| ------------------- | ---------------------------------------- |
| **不直接调 API**        | 页面不直接调 Supabase 或 AI API，统一走 `services/` |
| **疼痛强度统一用 0-10 整数** | 存储 int，展示时映射颜色和文案                        |
| **时间统一用 ISO 8601**  | 存 TIMESTAMPTZ，展示时格式化                     |
| **疼痛点位用归一化坐标**      | 存 0-1 的 x/y，适配不同屏幕尺寸                     |
| **AI 输出必须解析为 JSON** | 不直接展示 raw text，解析后渲染卡片                   |
| **免责声明常驻**          | 每个涉及 AI 建议的页面底部都有"AI 建议非医疗诊断"            |
| **敏感数据不进 prompt**   | 调 AI 前脱敏：不传用户名、手机号                       |

### 8.4 主题色

```css
/* styles/variables.wxss */
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

---

## 九、24 小时开发节奏建议

| 时段     | 任务                             | 产出          |
| ------ | ------------------------------ | ----------- |
| 0-2h   | 项目初始化 + Supabase 建表 + 目录结构     | 空壳可运行       |
| 2-6h   | 疼痛记录页面（点位标记 + 表单 + Mock 数据）    | 核心功能可 Demo  |
| 6-9h   | AI 舒缓方案（对接 AI API + 流式展示）      | AI 功能可 Demo |
| 9-13h  | 生命力复盘（环形图 + 趋势曲线 + Mock 数据）    | 复盘可 Demo    |
| 13-16h | 就医报告预览（数据聚合 + 预览页）             | 报告可 Demo    |
| 16-18h | 首页整合 + 导航 + 状态栏                | 完整流程可走通     |
| 18-20h | 登录授权 + 隐私协议 + Supabase Auth 对接 | 可登录可存储      |
| 20-22h | UI 打磨 + 主题色 + 交互细节             | 可演示         |
| 22-24h | Bug 修复 + 录屏 + 准备提交             | 交付          |

---

## 十、扩展性预留（不做但留好接口）

| 扩展方向    | 预留方式                                            | 不做的理由     |
| ------- | ----------------------------------------------- | --------- |
| 社区功能    | `profiles` 表已预留 `following` 字段扩展空间              | MVP 不需要   |
| 可穿戴设备   | `pain_records` 已有 `ai_analysis` JSONB 字段可扩展     | MVP 不需要   |
| 多语言     | 样式层已用 CSS 变量，文案集中在 `i18n/` 目录（预留）               | 初期仅中文     |
| AI 模型切换 | `services/ai-relief.js` 抽象 AI 调用层，支持切换 provider | 先用一家      |
| 跨平台迁移   | 原生小程序代码结构清晰，后续可迁移 Taro                          | MVP 先跑通微信 |

---

> **架构不是一成不变的。** 这份方案满足当前 6 个功能的 MVP 交付，同时为第二阶段（PDF 下载、经期预测、语音录入）和第三阶段（应用市场发布、多端同步）预留了扩展空间。随着项目发展逐步调整。
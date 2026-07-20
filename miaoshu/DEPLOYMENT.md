# 喵舒 · 部署与调试指南

## 一、微信小程序真机调试

### 1. 注册微信小程序

1. 访问 [微信公众平台](https://mp.weixin.qq.com/)
2. 注册小程序账号（个人或企业主体）
3. 登录后进入 **开发 → 开发管理 → 开发设置**
4. 复制 **AppID(小程序ID)**，例如：`wx2d64dfe82b80b24b`

> 当前项目已配置 AppID：`wx2d64dfe82b80b24b`

### 2. 配置项目 AppID

当前 `project.config.json` 中已配置：

```json
{
  "appid": "wx2d64dfe82b80b24b"
}
```

如 AppID 变更，可在微信开发者工具中：

1. 打开项目，点击右上角 **详情 → 基本信息**
2. 在 **AppID** 一栏填入新的 AppID

### 3. 配置服务器域名

小程序所有网络请求必须在 **微信小程序后台 → 开发 → 开发管理 → 服务器域名** 中配置：

| 类型 | 域名 | 说明 |
|------|------|------|
| request | `https://cwrthbjlmthddeljgnqg.supabase.co` | Supabase 数据 API |
| request | `https://open.bigmodel.cn` | AI 接口（如走客户端直调） |
| uploadFile | `https://cwrthbjlmthddeljgnqg.supabase.co` | 文件上传 |
| downloadFile | `https://cwrthbjlmthddeljgnqg.supabase.co` | 文件下载 |

如果走 Edge Function，只需要配置 Supabase 域名即可。

### 4. 配置环境变量

当前项目已内置配置：

```javascript
SUPABASE_URL: 'https://cwrthbjlmthddeljgnqg.supabase.co',
SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_MIFbTMMeLaWyA2FouPG_5Q_Jm17d2-B',
WECHAT_APP_ID: 'wx2d64dfe82b80b24b',
```

如需本地覆盖，可复制 `.env.example` 为 `.env`，填入：

```bash
SUPABASE_URL=https://cwrthbjlmthddeljgnqg.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_MIFbTMMeLaWyA2FouPG_5Q_Jm17d2-B
SUPABASE_ANON_KEY=

AI_API_KEY=your_ai_api_key_here
AI_API_ENDPOINT=https://open.bigmodel.cn/api/paas/v4/chat/completions
AI_MODEL=glm-5.2

WECHAT_APP_ID=wx2d64dfe82b80b24b
```

### 5. 真机调试步骤

1. 微信开发者工具点击 **预览** → 生成二维码
2. 用微信扫码，打开小程序预览版
3. 在真机上测试登录、记录、AI 舒缓、复盘等功能
4. 打开 **调试模式**：点击右上角 ⋮ → 开发调试 → 打开调试

### 6. 常见问题

| 问题 | 解决方案 |
|------|---------|
| 登录失败 | 检查 AppID 是否正确；检查服务器域名是否配置 |
| 请求 Supabase 失败 | 确认域名已加入 request 白名单；确认 publishable key 有效 |
| AI 舒缓无响应 | 检查 Edge Function 是否部署；检查 `ai-proxy` 是否返回 |
| 真机无法打开 | 确认开发者工具中已上传体验版或预览版 |

---

## 二、后端部署

### Supabase 项目

- 项目地址：https://supabase.com/dashboard/project/cwrthbjlmthddeljgnqg
- 已部署 Edge Functions：
  - `ai-proxy`
  - `pdf-export`
- 已创建数据表：
  - `profiles`
  - `pain_records`
  - `relief_plans`
  - `monthly_reviews`
  - `medical_reports`

### 重新部署 Edge Functions

```bash
cd miaoshu
npx supabase functions deploy ai-proxy pdf-export --project-ref cwrthbjlmthddeljgnqg --no-verify-jwt
```

---

## 三、Demo 预览

前端 HTML 高保真原型已部署至：

**https://miaoshu-demo.codebanana.app**

微信小程序源码位于 `miaoshu/` 目录，需用微信开发者工具打开。

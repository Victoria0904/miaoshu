# 喵舒 · 部署说明

## 前端部署

### 微信小程序本地运行

1. 安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 在微信开发者工具中点击「项目」→「导入项目」
3. 选择 `miaoshu/` 目录，填入你的小程序 AppID（或使用测试号）
4. 点击「编译」即可预览

### 环境变量

复制 `.env.example` 为 `.env`，填入：

```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
AI_API_KEY=your_glm_or_kimi_api_key
AI_API_ENDPOINT=https://open.bigmodel.cn/api/paas/v4
WECHAT_APP_ID=your_app_id
```

## 后端部署

### Supabase 配置

1. 创建 Supabase 项目
2. 执行 `supabase/migrations/` 中的 SQL 建表脚本
3. 配置 RLS 策略
4. 创建 Edge Functions 用于 AI 中转和 PDF 生成

## Demo 预览

前端 HTML 高保真原型已部署至：

**https://miaoshu-demo.codebanana.app**

微信小程序源码位于 `miaoshu/` 目录，需用微信开发者工具打开。

# 喵舒 · 女性生命力养护湾

> 面向进行性加重痛经女性的 AI 疼痛评估与就医导航工具（微信小程序 MVP）

## 项目简介

喵舒帮助女性在「识别 → 记录 → 评估 → 缓解 → 复盘 → 就医导航」的完整养护链路上，重新掌控自己的身体节奏与好看时间。

## 核心功能

1. 疼痛记录（含人体疼痛点位标记）
2. 疼痛评估（VAS 0-10）
3. AI 疼痛舒缓（按场景生成非药物方案）
4. 生命力复盘（五种时间环形图 + 趋势曲线）
5. 就医报告导出（结构化报告预览）
6. AI 就医导航（跨周期异常信号提示）

## 技术栈

- 微信小程序原生
- JavaScript ES2020+
- mobx-miniprogram
- Supabase（BaaS）
- GLM-5.2 / Kimi K2.7 Code（AI）
- Canvas 2D + 原生图表

## 目录结构

```
miaoshu/
├── app.js / app.json / app.wxss
├── pages/       # 页面
├── components/  # 公共组件
├── services/    # API 封装
├── utils/       # 工具函数
├── store/       # 全局状态
├── styles/      # 公共样式
└── assets/      # 静态资源
```

## 本地开发

1. 用微信开发者工具打开 `miaoshu/` 目录
2. 填入你自己的真实小程序 AppID（或先用测试号 `touristappid`）
3. 安装依赖：`npm install`
4. 点击「编译」预览

> 为保护隐私，远程仓库中不保存真实 AppID。请在本地 `miaoshu/project.config.json` 和 `.env` 中配置。

## 环境变量

复制 `.env.example` 为 `.env`，填入真实的 Supabase 和 AI API 密钥。

## Mock 模式

开发阶段默认开启 Mock 数据（`services/mock-data.js` 中 `USE_MOCK = true`），无需真实后端即可完整体验核心流程。

## 免责声明

本应用为 AI 辅助工具，所有建议仅供参考，不构成医疗诊断或治疗建议。紧急情况请立即就医。

/**
 * 环境变量/全局配置读取
 * 微信小程序不支持 process.env，这里通过 getApp().globalData.config 注入
 */

// 默认配置，会被 app.js 中读取的 .env 或构建配置覆盖
const DEFAULT_CONFIG = {
  SUPABASE_URL: 'https://arujfjeshqvxyxbivknu.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFydWpmamVzaHF2eHl4Yml2a251Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NDAxNTYsImV4cCI6MjEwMDExNjE1Nn0.gvwjYw-w1ZG_SWpeXs76FwkJf7cXI50rcV8TwstBMPk',
  AI_API_KEY: '',
  AI_API_ENDPOINT: 'https://open.bigmodel.cn/api/paas/v4',
  AI_MODEL: 'glm-5.2',
  WECHAT_APP_ID: '',
};

export function getConfig() {
  const app = getApp ? getApp() : null;
  if (app && app.globalData && app.globalData.config) {
    return { ...DEFAULT_CONFIG, ...app.globalData.config };
  }
  return DEFAULT_CONFIG;
}

/**
 * 环境变量/全局配置读取
 * 微信小程序不支持 process.env，这里通过 getApp().globalData.config 注入
 */

// 喵舒 Supabase 项目：cwrthbjlmthddeljgnqg
const DEFAULT_CONFIG = {
  SUPABASE_URL: 'https://cwrthbjlmthddeljgnqg.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_MIFbTMMeLaWyA2FouPG_5Q_Jm17d2-B',
  SUPABASE_ANON_KEY: '',
  AI_API_ENDPOINT: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  AI_MODEL: 'glm-5.2',
  WECHAT_APP_ID: 'wx2d64dfe82b80b24b',
};

export function getConfig() {
  const app = getApp ? getApp() : null;
  if (app && app.globalData && app.globalData.config) {
    return { ...DEFAULT_CONFIG, ...app.globalData.config };
  }
  return DEFAULT_CONFIG;
}

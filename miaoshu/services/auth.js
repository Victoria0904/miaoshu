import { supabase, upsertProfile } from './supabase';

/**
 * 微信一键登录并同步到 Supabase Auth 与 profiles 表
 * @returns {Promise<{user: object, session: object}>}
 */
export async function loginWithWechat() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: async (res) => {
        if (!res.code) {
          reject(new Error('微信登录失败：未获取到 code'));
          return;
        }

        try {
          // 通过 Edge Function 或后端服务把 code 换成 openid/session_key
          // 这里先用微信官方方式：code -> openid（真实环境需要在后端完成）
          const { openid } = await exchangeCodeForOpenId(res.code);

          if (!openid) {
            reject(new Error('未能获取 openid'));
            return;
          }

          // 在 Supabase 中创建/更新用户档案
          const profile = await upsertProfile({
            openid,
            nickname: '喵舒用户',
          });

          // 使用 openid 作为本地会话标识
          wx.setStorageSync('access_token', openid);
          wx.setStorageSync('openid', openid);

          resolve({
            user: profile,
            session: { openid, access_token: openid },
          });
        } catch (err) {
          reject(err);
        }
      },
      fail: (err) => reject(err),
    });
  });
}

/**
 * 获取当前登录用户的 openid
 */
export function getCurrentOpenId() {
  return wx.getStorageSync('openid') || wx.getStorageSync('access_token');
}

/**
 * 获取当前 Supabase 用户 profile
 */
export async function getCurrentProfile() {
  const openid = getCurrentOpenId();
  if (!openid) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('openid', openid)
    .single();
  if (error) throw error;
  return data;
}

/**
 * 退出登录
 */
export function logout() {
  wx.removeStorageSync('access_token');
  wx.removeStorageSync('openid');
  return supabase.auth.signOut().catch(() => {});
}

/**
 * 检查登录状态
 */
export function isLoggedIn() {
  return !!getCurrentOpenId();
}

/**
 * 模拟 code -> openid 兑换（真实环境需后端完成）
 */
async function exchangeCodeForOpenId(code) {
  // 真实环境：把 code 发到你的后端/Edge Function，调用微信 auth.code2Session
  // 返回 { openid, session_key }
  return { openid: `wx_${code.slice(-16)}` };
}

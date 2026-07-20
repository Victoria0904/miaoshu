import { createClient } from '@supabase/supabase-js';

// 从环境变量/全局配置中获取
const { SUPABASE_URL, SUPABASE_ANON_KEY } = getApp().globalData.config || {};

export const supabase = createClient(
  SUPABASE_URL || 'https://arujfjeshqvxyxbivknu.supabase.co',
  SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFydWpmamVzaHF2eHl4Yml2a251Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NDAxNTYsImV4cCI6MjEwMDExNjE1Nn0.gvwjYw-w1ZG_SWpeXs76FwkJf7cXI50rcV8TwstBMPk'
);

// 用户档案相关
export async function upsertProfile(profile) {
  const { data, error } = await supabase
    .from('profiles")
    .upsert(profile, { onConflict: "openid" })
    .select();
  if (error) throw error;
  return data[0];
}

export async function getProfile(openid) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('openid', openid)
    .single();
  if (error) throw error;
  return data;
}

// 疼痛记录相关
export async function fetchPainRecords(userId, options = {}) {
  let query = supabase
    .from('pain_records')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (options.limit) {
    query = query.limit(options.limit);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function insertPainRecord(record) {
  const { data, error } = await supabase
    .from('pain_records')
    .insert(record)
    .select();
  if (error) throw error;
  return data[0];
}

export async function deletePainRecord(id) {
  const { error } = await supabase
    .from('pain_records')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
}

// 舒缓方案相关
export async function insertReliefPlan(plan) {
  const { data, error } = await supabase
    .from('relief_plans')
    .insert(plan)
    .select();
  if (error) throw error;
  return data[0];
}

export async function fetchReliefPlans(userId) {
  const { data, error } = await supabase
    .from('relief_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

-- 喵舒 · 女性生命力养护湾 · 数据库 Schema
-- PostgreSQL 17 + JSONB

-- 用户档案表
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  openid TEXT UNIQUE NOT NULL,
  nickname TEXT,
  avatar_url TEXT,
  age_range TEXT,                    -- '18-25' | '26-35' | '36-45' | '46+'
  constitution_tag TEXT,             -- 中医体质标签
  cycle_length INT,
  period_length INT,
  last_period_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 疼痛记录表
CREATE TABLE IF NOT EXISTS public.pain_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pain_intensity INT NOT NULL CHECK (pain_intensity >= 0 AND pain_intensity <= 10),
  pain_type TEXT,
  pain_locations JSONB DEFAULT '[]'::jsonb,    -- [{x, y, intensity, zone, label}]
  symptoms JSONB DEFAULT '[]'::jsonb,          -- ['恶心', '呕吐', ...]
  triggers JSONB DEFAULT '[]'::jsonb,
  relief_methods JSONB DEFAULT '[]'::jsonb,
  medications JSONB DEFAULT '[]'::jsonb,
  period_day INT,
  cycle_phase TEXT,
  scene TEXT,
  ai_analysis JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI 舒缓方案表
CREATE TABLE IF NOT EXISTS public.relief_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pain_record_id UUID REFERENCES public.pain_records(id) ON DELETE SET NULL,
  scene TEXT,
  plan_content JSONB DEFAULT '[]'::jsonb,        -- [{action, duration, difficulty, area}]
  avoid_items JSONB DEFAULT '[]'::jsonb,
  time_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 月度复盘表
CREATE TABLE IF NOT EXISTS public.monthly_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  pain_hours DECIMAL(5,2),
  time_breakdown JSONB DEFAULT '[]'::jsonb,    -- {survival, earning, beauty, fun, flow}
  stolen_beauty_hours DECIMAL(5,2),
  ai_suggestion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- 就医报告表
CREATE TABLE IF NOT EXISTS public.medical_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date_range_start DATE,
  date_range_end DATE,
  report_content JSONB DEFAULT '{}'::jsonb,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建更新时间戳触发器
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 启用 RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pain_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relief_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_reports ENABLE ROW LEVEL SECURITY;

-- RLS 策略：用户只能访问自己的数据
CREATE POLICY "用户只能查看自己的资料" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "用户只能更新自己的资料" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "用户只能查看自己的疼痛记录" ON public.pain_records
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "用户只能创建自己的疼痛记录" ON public.pain_records
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "用户只能更新自己的疼痛记录" ON public.pain_records
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "用户只能删除自己的疼痛记录" ON public.pain_records
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "用户只能查看自己的舒缓方案" ON public.relief_plans
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "用户只能创建自己的舒缓方案" ON public.relief_plans
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "用户只能查看自己的月度复盘" ON public.monthly_reviews
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "用户只能查看自己的就医报告" ON public.medical_reports
  FOR SELECT USING (user_id = auth.uid());

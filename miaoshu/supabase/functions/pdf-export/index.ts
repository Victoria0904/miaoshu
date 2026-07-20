import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, startDate, endDate } = await req.json();

    if (!userId || !startDate || !endDate) {
      return new Response(JSON.stringify({ error: '缺少 userId / startDate / endDate' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 从 Supabase 查询该用户的疼痛记录
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: records, error } = await supabase
      .from('pain_records')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // TODO: 使用 Puppeteer 生成 PDF
    // 由于 Deno Edge Functions 环境限制，Puppeteer 无法直接运行，
    // 建议：生成 HTML 后转存到 Supabase Storage，再用外部服务渲染为 PDF。

    return new Response(
      JSON.stringify({
        message: 'PDF 生成占位接口',
        recordsCount: records?.length || 0,
        htmlPreview: `<html><body><h1>就医报告</h1><p>共 ${records?.length || 0} 条记录</p></body></html>`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

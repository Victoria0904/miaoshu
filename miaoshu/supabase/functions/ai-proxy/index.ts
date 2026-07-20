import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReliefPayload {
  intensity: number;
  painType: string;
  scene: string;
  constitution: string;
}

const SYSTEM_PROMPT = `你是喵舒·女性生命力养护湾的 AI 疼痛舒缓助手。
你提供的是生活调节建议（非药物、非医疗方案），聚焦保暖、舒缓动作、呼吸法、姿势调整等。
你不能诊断疾病、不能推荐药物或检查。
输出必须是结构化的 JSON，包含 actions、avoid_items、time_summary 字段。`;

function buildPrompt(payload: ReliefPayload) {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `疼痛强度：${payload.intensity}/10，性质：${payload.painType}，场景：${payload.scene}，体质：${payload.constitution}。请生成分钟级舒缓方案。`,
    },
  ];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { intensity, painType, scene, constitution } = await req.json();

    // 简单脱敏校验
    if (intensity === undefined || !painType || !scene || !constitution) {
      return new Response(JSON.stringify({ error: '缺少必要参数' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('AI_API_KEY');
    const endpoint = Deno.env.get('AI_API_ENDPOINT') || 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    const model = Deno.env.get('AI_MODEL') || 'glm-5.2';

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AI API Key 未配置' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        stream: false,
        messages: buildPrompt({ intensity, painType, scene, constitution }),
      }),
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

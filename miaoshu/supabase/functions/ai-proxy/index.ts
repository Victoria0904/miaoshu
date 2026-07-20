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

const DEFAULT_RESPONSE = {
  totalMinutes: 18,
  timeSummary: '完成全套方案约 18 分钟，帮你夺回今天 0.3 小时',
  actions: [
    { name: '腹部热敷', desc: '将暖宝宝或热水袋置于下腹部，温度适宜不烫皮肤', duration: 15, area: '腹部' },
    { name: '三阴交穴位按压', desc: '内踝尖上 4 横指处，拇指按压 30 秒/侧，交替进行', duration: 5, area: '腿部' },
    { name: '腹式呼吸法', desc: '仰卧或坐直，手放腹部，鼻吸气 4 秒→屏息 2 秒→口呼气 6 秒，重复 10 次', duration: 8, area: '全身' },
    { name: '婴儿式放松', desc: '跪坐，上身前倾趴在枕头上，手臂自然前伸，保持 3-5 分钟', duration: 5, area: '全身' },
    { name: '猫牛式伸展', desc: '四点跪姿，吸气塌腰抬头，呼气拱背低头，缓慢重复 8-10 次', duration: 5, area: '腰背' },
  ],
  avoidItems: ['避免冷饮和生冷食物', '避免剧烈运动和腹部受压', '避免空调直吹腹部'],
};

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

    // 如果 AI_API_KEY 为空或占位，返回默认 Mock 方案
    if (!apiKey || apiKey.includes('your_real_api_key') || apiKey.includes('test_key') || apiKey.includes('placeholder')) {
      return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(DEFAULT_RESPONSE) } }] }), {
        status: 200,
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

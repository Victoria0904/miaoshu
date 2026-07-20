import { USE_MOCK, mockReliefPlans } from './mock-data';
import { getConfig } from '../utils/env';

export async function generateReliefPlan({ intensity, painType, scene, constitution }) {
  if (USE_MOCK) {
    await delay(1500);
    const plan = mockReliefPlans[scene] || mockReliefPlans.home;
    return plan;
  }

  // 真实环境：调用 Supabase Edge Function ai-proxy
  const config = getConfig();
  const response = await fetch(`${config.SUPABASE_URL}/functions/v1/ai-proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ intensity, painType, scene, constitution }),
  });

  if (!response.ok) {
    throw new Error(`AI proxy failed: ${response.statusText}`);
  }

  const data = await response.json();
  // 根据模型返回结构解析，这里假设 data.choices[0].message.content 为 JSON 字符串
  const content = data.choices?.[0]?.message?.content || data.content || JSON.stringify(data);
  try {
    const parsed = JSON.parse(content);
    return {
      totalMinutes: parsed.totalMinutes || 0,
      actions: parsed.actions || [],
      avoidItems: parsed.avoid_items || parsed.avoidItems || [],
      timeSummary: parsed.time_summary || parsed.timeSummary || '',
    };
  } catch (e) {
    return {
      totalMinutes: 15,
      actions: [{ name: 'AI 返回结果', desc: content, duration: 15, area: '全身' }],
      avoidItems: [],
      timeSummary: '',
    };
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

import { USE_MOCK, mockReliefPlans } from './mock-data';

export async function generateReliefPlan({ intensity, painType, scene, constitution }) {
  if (USE_MOCK) {
    await delay(1500);
    const plan = mockReliefPlans[scene] || mockReliefPlans.home;
    return plan;
  }

  // 真实 AI 调用（SSE）
  const response = await callLLM({ intensity, painType, scene, constitution });
  return response;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callLLM(params) {
  // TODO: 接入真实 LLM API（GLM-5.2 / Kimi K2.7）
  const { AI_API_KEY, AI_API_ENDPOINT } = getApp().globalData.config || {};
  return fetch(`${AI_API_ENDPOINT}/chat/completions`, {
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'glm-5.2',
      stream: true,
      messages: buildPrompt(params),
    }),
  });
}

function buildPrompt({ intensity, painType, scene, constitution }) {
  return [
    {
      role: 'system',
      content:
        '你是喵舒·女性生命力养护湾的 AI 疼痛舒缓助手。你提供的是生活调节建议（非药物、非医疗方案），聚焦保暖、舒缓动作、呼吸法、姿势调整等。你不能诊断疾病、不能推荐药物或检查。输出必须是结构化的 JSON，包含 actions、avoid_items、time_summary 字段。',
    },
    {
      role: 'user',
      content: `疼痛强度：${intensity}/10，性质：${painType}，场景：${scene}，体质：${constitution}。请生成分钟级舒缓方案。`,
    },
  ];
}

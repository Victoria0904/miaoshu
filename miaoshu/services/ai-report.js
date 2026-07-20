import { USE_MOCK, mockMedicalReport } from './mock-data';

export async function generateMedicalReport(records) {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return mockMedicalReport;
  }

  // 真实 AI 调用
  const prompt = buildReportPrompt(records);
  // return callLLM(prompt);
  return Promise.resolve(mockMedicalReport);
}

function buildReportPrompt(records) {
  return {
    role: 'system',
    content:
      '你是喵舒的就医报告助手。请根据用户的疼痛记录，生成结构化的就医沟通辅助报告，包含主诉、现病史摘要、用药记录、建议咨询医生的问题、需关注的异常信号。你不能给出诊断、不能推荐具体检查或药物。',
  };
}

import { USE_MOCK, mockReviewData } from './mock-data';

export async function getMonthlyReview(month) {
  if (USE_MOCK) {
    return Promise.resolve(mockReviewData);
  }
  return Promise.resolve(mockReviewData);
}

export function calcReviewSummary(records) {
  if (!records || records.length === 0) {
    return {
      avgIntensity: 0,
      painCount: 0,
      stolenBeautyHours: 0,
    };
  }
  const total = records.reduce((sum, r) => sum + r.painIntensity, 0);
  return {
    avgIntensity: (total / records.length).toFixed(1),
    painCount: records.length,
    stolenBeautyHours: (records.length * 2.5).toFixed(1),
  };
}

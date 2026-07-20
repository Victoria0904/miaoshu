import { USE_MOCK, mockPainRecords } from './mock-data';
import { getStorage, setStorage } from '../utils/storage';
import { formatDateTime } from '../utils/format';
import { fetchPainRecords, insertPainRecord as insertToSupabase } from './supabase';

const LOCAL_KEY = 'pain_records_local';

function getLocalRecords() {
  return getStorage(LOCAL_KEY) || [];
}

function saveLocalRecords(records) {
  setStorage(LOCAL_KEY, records);
}

export async function getPainRecords(userId) {
  if (USE_MOCK) {
    return Promise.resolve(mockPainRecords);
  }
  // 优先从 Supabase 获取真实数据
  try {
    const records = await fetchPainRecords(userId, { limit: 100 });
    if (records && records.length > 0) {
      return records.map(formatRecordFromDB);
    }
  } catch (e) {
    console.warn('[pain-record] fetch from supabase failed, fallback local', e);
  }
  return Promise.resolve(getLocalRecords());
}

export async function createPainRecord(record) {
  const newRecord = {
    ...record,
    id: `r_${Date.now()}`,
    dateText: formatDateTime(new Date()),
    createdAt: new Date().toISOString(),
  };

  if (USE_MOCK) {
    mockPainRecords.unshift(newRecord);
    return Promise.resolve(newRecord);
  }

  // 真实环境写入 Supabase
  try {
    const dbRecord = {
      user_id: record.userId,
      pain_intensity: record.painIntensity,
      pain_type: record.painType,
      pain_locations: record.painLocations || [],
      symptoms: record.symptoms || [],
      scene: record.scene,
      period_day: record.periodDay,
      cycle_phase: record.cyclePhase,
    };
    const inserted = await insertToSupabase(dbRecord);
    return formatRecordFromDB(inserted);
  } catch (e) {
    console.warn('[pain-record] insert to supabase failed, fallback local', e);
    const records = getLocalRecords();
    records.unshift(newRecord);
    saveLocalRecords(records);
    return Promise.resolve(newRecord);
  }
}

export async function deletePainRecord(id) {
  if (USE_MOCK) {
    const idx = mockPainRecords.findIndex((r) => r.id === id);
    if (idx > -1) mockPainRecords.splice(idx, 1);
    return Promise.resolve(true);
  }
  const records = getLocalRecords().filter((r) => r.id !== id);
  saveLocalRecords(records);
  return Promise.resolve(true);
}

function formatRecordFromDB(record) {
  return {
    id: record.id,
    userId: record.user_id,
    painIntensity: record.pain_intensity,
    painType: record.pain_type,
    painLocations: record.pain_locations || [],
    symptoms: record.symptoms || [],
    scene: record.scene,
    sceneLabel: record.scene,
    periodDay: record.period_day,
    cyclePhase: record.cycle_phase,
    dateText: formatDateTime(record.created_at),
    createdAt: record.created_at,
  };
}

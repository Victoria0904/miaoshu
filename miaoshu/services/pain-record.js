import { USE_MOCK, mockPainRecords } from './mock-data';
import { getStorage, setStorage } from '../utils/storage';
import { formatDateTime } from '../utils/format';

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
  // 真实接口：return supabase.from('pain_records').select('*').eq('user_id', userId);
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

  const records = getLocalRecords();
  records.unshift(newRecord);
  saveLocalRecords(records);
  return Promise.resolve(newRecord);
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

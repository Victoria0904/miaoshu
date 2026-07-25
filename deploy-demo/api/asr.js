const crypto = require('crypto');

// Vercel Node 18+ has native fetch; use global fetch if available
const fetch = globalThis.fetch;

// 腾讯云 API 签名 V3
function sha256(message) {
  return crypto.createHash('sha256').update(message).digest('hex');
}
function hmacSha256(key, message) {
  return crypto.createHmac('sha256', key).update(message).digest();
}

module.exports = async (req, res) => {
  // 允许 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // 生产环境务必使用 Vercel 环境变量配置 TENCENT_SECRET_ID / TENCENT_SECRET_KEY。
  const secretId = process.env.TENCENT_SECRET_ID;
  const secretKey = process.env.TENCENT_SECRET_KEY;
  const region = process.env.TENCENT_REGION || 'ap-guangzhou';

  if (!secretId || !secretKey) {
    res.status(500).json({ error: 'Server ASR config missing', Response: { Error: { Message: 'Server ASR config missing' } } });
    return;
  }

  const { Data, VoiceFormat = 'wav' } = req.body || {};
  if (!Data || typeof Data !== 'string') {
    res.status(400).json({ error: 'Missing audio base64 data' });
    return;
  }

  // DataLen 为 base64 解码前的原始字节数
  let dataLen = 0;
  try {
    dataLen = Buffer.from(Data, 'base64').length;
  } catch (e) {
    dataLen = Math.floor(Data.length * 0.75);
  }

  const service = 'asr';
  const host = 'asr.tencentcloudapi.com';
  const action = 'SentenceRecognition';
  const version = '2019-06-14';
  const timestamp = Math.floor(Date.now() / 1000);
  const date = new Date(timestamp * 1000).toISOString().split('T')[0];

  const payload = {
    ProjectId: 0,
    SubServiceType: 2,
    EngSerViceType: '16k_zh',
    SourceType: 1,
    VoiceFormat: VoiceFormat === 'webm' ? 'wav' : VoiceFormat,
    Data,
    DataLen: dataLen,
    FilterDirty: 0,
    FilterModal: 0,
    FilterPunc: 0,
    ConvertNumMode: 1,
  };

  const payloadJson = JSON.stringify(payload);
  const hashedRequestPayload = sha256(payloadJson);
  const httpRequestMethod = 'POST';
  const canonicalUri = '/';
  const canonicalQueryString = '';
  const canonicalHeaders = `content-type:application/json\nhost:${host}\n`;
  const signedHeaders = 'content-type;host';
  const canonicalRequest = `${httpRequestMethod}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${hashedRequestPayload}`;
  const credentialScope = `${date}/${service}/tc3_request`;
  const stringToSign = `TC3-HMAC-SHA256\n${timestamp}\n${credentialScope}\n${sha256(canonicalRequest)}`;

  const secretDate = hmacSha256(`TC3${secretKey}`, date);
  const secretService = hmacSha256(secretDate, service);
  const secretSigning = hmacSha256(secretService, 'tc3_request');
  const signature = hmacSha256(secretSigning, stringToSign).toString('hex');

  const authorization = `TC3-HMAC-SHA256 Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  try {
    const response = await fetch(`https://${host}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Host': host,
        'X-TC-Action': action,
        'X-TC-Version': version,
        'X-TC-Timestamp': String(timestamp),
        'X-TC-Region': region,
        'Authorization': authorization,
      },
      body: payloadJson,
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(502).json({ error: err.message || 'ASR proxy failed' });
  }
};

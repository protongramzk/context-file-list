// Configuration & LocalStorage Management
export const FIELD_CONTENT = 'content';
export const FIELD_FILE = 'file';

export let CONFIG = {
  webhookUrl: '',
  auth: {
    enabled: false,
    type: 'basic',
    username: '',
    password: '',
    headerKey: '',
    headerValue: '',
    jwtToken: ''
  },
  tts: {
    provider: 'bytez',
    elevenLabsKeys: [],
    activeElevenLabsKeyId: null
  }
};

export function loadConfig() {
  const savedUrl = localStorage.getItem('webhook_url');
  if (savedUrl) CONFIG.webhookUrl = savedUrl;
  
  const savedAuth = localStorage.getItem('auth_config');
  if (savedAuth) CONFIG.auth = JSON.parse(savedAuth);
  
  const savedTTS = localStorage.getItem('tts_config');
  if (savedTTS) CONFIG.tts = JSON.parse(savedTTS);
}

export function saveWebhookUrl(url) {
  CONFIG.webhookUrl = url;
  localStorage.setItem('webhook_url', url);
}

export function saveAuth() {
  localStorage.setItem('auth_config', JSON.stringify(CONFIG.auth));
}

export function saveTTS() {
  localStorage.setItem('tts_config', JSON.stringify(CONFIG.tts));
}
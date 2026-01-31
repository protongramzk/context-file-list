// Settings Dialog Management
import { CONFIG, saveWebhookUrl, saveAuth, saveTTS } from './config.js';
import { showToast, updateConnectionStatus } from './ui.js';

export function openSettings() {
  document.getElementById('settingsDialog').classList.add('open');
  updateSettingsUI();
}

export function closeSettings() {
  document.getElementById('settingsDialog').classList.remove('open');
}

export function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `tab-${tab}`);
  });
}

export function updateSettingsUI() {
  document.getElementById('webhookUrlInput').value = CONFIG.webhookUrl;
  const webhookStatus = document.getElementById('webhookStatus');
  const webhookContent = document.getElementById('webhookContent');
  
  if (CONFIG.webhookUrl) {
    webhookStatus.style.display = 'block';
    webhookContent.classList.remove('expanded');
    document.getElementById('webhookExpand').classList.remove('expanded');
  } else {
    webhookStatus.style.display = 'none';
    webhookContent.classList.add('expanded');
    document.getElementById('webhookExpand').classList.add('expanded');
  }
  
  const authSwitch = document.getElementById('authSwitch');
  authSwitch.classList.toggle('on', CONFIG.auth.enabled);
  document.getElementById('authFields').style.display = CONFIG.auth.enabled ? 'block' : 'none';
  document.getElementById('authTypeSelect').value = CONFIG.auth.type;
  document.getElementById('authUsername').value = CONFIG.auth.username || '';
  document.getElementById('authPassword').value = CONFIG.auth.password || '';
  document.getElementById('authHeaderKey').value = CONFIG.auth.headerKey || '';
  document.getElementById('authHeaderValue').value = CONFIG.auth.headerValue || '';
  document.getElementById('authJwtToken').value = CONFIG.auth.jwtToken || '';
  updateAuthFields();
  
  const authStatus = document.getElementById('authStatus');
  if (CONFIG.auth.enabled) {
    authStatus.style.display = 'block';
    authStatus.textContent = `✓ Authentication enabled (${CONFIG.auth.type})`;
  } else {
    authStatus.style.display = 'none';
  }
  
  document.getElementById('ttsBytez').classList.toggle('active', CONFIG.tts.provider === 'bytez');
  document.getElementById('ttsElevenlabs').classList.toggle('active', CONFIG.tts.provider === 'elevenlabs');
  document.getElementById('elevenlabsSection').style.display = CONFIG.tts.provider === 'elevenlabs' ? 'block' : 'none';
  updateApiKeysList();
}

export function toggleWebhookExpand() {
  const content = document.getElementById('webhookContent');
  const btn = document.getElementById('webhookExpand');
  content.classList.toggle('expanded');
  btn.classList.toggle('expanded');
}

export function toggleAuthExpand() {
  const content = document.getElementById('authContent');
  const btn = document.getElementById('authExpand');
  content.classList.toggle('expanded');
  btn.classList.toggle('expanded');
}

export function saveWebhook() {
  const url = document.getElementById('webhookUrlInput').value.trim();
  if (!url) {
    showToast('Please enter a webhook URL', 'error');
    return;
  }
  
  saveWebhookUrl(url);
  showToast('Webhook URL saved!', 'success');
  updateConnectionStatus();
  updateSettingsUI();
}

export function toggleAuthEnabled() {
  CONFIG.auth.enabled = !CONFIG.auth.enabled;
  updateSettingsUI();
}

export function updateAuthFields() {
  const type = document.getElementById('authTypeSelect').value;
  CONFIG.auth.type = type;
  
  document.getElementById('basicAuthFields').style.display = type === 'basic' ? 'block' : 'none';
  document.getElementById('headerAuthFields').style.display = type === 'header' ? 'block' : 'none';
  document.getElementById('jwtAuthFields').style.display = type === 'jwt' ? 'block' : 'none';
}

export function saveAuthSettings() {
  CONFIG.auth.type = document.getElementById('authTypeSelect').value;
  CONFIG.auth.username = document.getElementById('authUsername').value;
  CONFIG.auth.password = document.getElementById('authPassword').value;
  CONFIG.auth.headerKey = document.getElementById('authHeaderKey').value;
  CONFIG.auth.headerValue = document.getElementById('authHeaderValue').value;
  CONFIG.auth.jwtToken = document.getElementById('authJwtToken').value;
  
  saveAuth();
  showToast('Authentication settings saved!', 'success');
  updateSettingsUI();
}

export function setTTSProvider(provider) {
  CONFIG.tts.provider = provider;
  saveTTS();
  updateSettingsUI();
}

export function updateApiKeysList() {
  const list = document.getElementById('apiKeysList');
  const count = document.getElementById('apiKeyCount');
  const noKeysMsg = document.getElementById('noKeysMessage');
  
  count.textContent = CONFIG.tts.elevenLabsKeys.length;
  noKeysMsg.style.display = CONFIG.tts.elevenLabsKeys.length === 0 ? 'block' : 'none';
  
  if (CONFIG.tts.elevenLabsKeys.length === 0) {
    list.innerHTML = '';
    return;
  }
  
  list.innerHTML = CONFIG.tts.elevenLabsKeys.map(key => `
    <div class="api-key-item ${CONFIG.tts.activeElevenLabsKeyId === key.id ? 'active' : ''}" data-id="${key.id}">
      <div class="api-key-select" onclick="window.selectApiKey(${key.id})">
        ${CONFIG.tts.activeElevenLabsKeyId === key.id ? '✓' : ''}
      </div>
      <div class="api-key-info">
        <div class="api-key-name">${key.name}</div>
        <div class="api-key-value">${key.key.slice(0, 10)}...${key.key.slice(-4)}</div>
      </div>
      <button class="api-key-delete" onclick="window.deleteApiKey(${key.id})">
        <svg class="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
      </button>
    </div>
  `).join('');
}

export function addApiKey() {
  const name = document.getElementById('newKeyName').value.trim();
  const key = document.getElementById('newKeyValue').value.trim();
  
  if (!name || !key) {
    showToast('Enter name and API key', 'error');
    return;
  }
  
  const newKey = { id: Date.now(), name, key };
  CONFIG.tts.elevenLabsKeys.push(newKey);
  
  if (!CONFIG.tts.activeElevenLabsKeyId) {
    CONFIG.tts.activeElevenLabsKeyId = newKey.id;
  }
  
  saveTTS();
  
  document.getElementById('newKeyName').value = '';
  document.getElementById('newKeyValue').value = '';
  
  updateApiKeysList();
  showToast('API key added!', 'success');
}

export function selectApiKey(id) {
  CONFIG.tts.activeElevenLabsKeyId = id;
  saveTTS();
  updateApiKeysList();
}

export function deleteApiKey(id) {
  CONFIG.tts.elevenLabsKeys = CONFIG.tts.elevenLabsKeys.filter(k => k.id !== id);
  
  if (CONFIG.tts.activeElevenLabsKeyId === id) {
    CONFIG.tts.activeElevenLabsKeyId = CONFIG.tts.elevenLabsKeys.length > 0 
      ? CONFIG.tts.elevenLabsKeys[0].id 
      : null;
  }
  
  saveTTS();
  updateApiKeysList();
  showToast('API key deleted', 'success');
}

// Make functions globally accessible for onclick handlers
window.selectApiKey = selectApiKey;
window.deleteApiKey = deleteApiKey;
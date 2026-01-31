// Main Entry Point - Initialization & Event Listeners
import { loadConfig } from './config.js';
import { loadCurrentMode } from './state.js';
import { 
  updateConnectionStatus, 
  updateModeUI, 
  toggleModeDropdown, 
  setMode, 
  updateSendButton 
} from './ui.js';
import { handleFileSelect } from './files.js';
import { 
  toggleMic, 
  sendNow, 
  handleOrbClick, 
  toggleVoiceRecord, 
  toggleTextInput 
} from './voice.js';
import { sendMessage, handleKeyDown } from './webhook.js';
import * as settings from './settings.js';
import { initThemes } from './themes.js';

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  loadConfig();
  loadCurrentMode();
  updateConnectionStatus();
  updateModeUI();
  settings.updateSettingsUI();
  initThemes();
  
  setupEventListeners();
});

function setupEventListeners() {
  // Header
  document.getElementById('settingsBtn').addEventListener('click', settings.openSettings);
  
  // Orb
  document.getElementById('orbContainer').addEventListener('click', handleOrbClick);
  
  // Voice controls
  document.getElementById('micToggleBtn').addEventListener('click', toggleMic);
  document.getElementById('sendNowBtn').addEventListener('click', sendNow);
  document.getElementById('toggleTextInputBtn').addEventListener('click', toggleTextInput);
  
  // Mode selector
  document.getElementById('modeSelectorBtn').addEventListener('click', toggleModeDropdown);
  document.querySelectorAll('.mode-option').forEach(option => {
    option.addEventListener('click', () => setMode(option.dataset.mode));
  });
  
  // Chat input
  document.getElementById('messageInput').addEventListener('input', updateSendButton);
  document.getElementById('messageInput').addEventListener('keydown', handleKeyDown);
  document.getElementById('sendBtn').addEventListener('click', sendMessage);
  document.getElementById('voiceRecordBtn').addEventListener('click', toggleVoiceRecord);
  document.getElementById('attachFileBtn').addEventListener('click', () => {
    document.getElementById('fileInput').click();
  });
  document.getElementById('fileInput').addEventListener('change', handleFileSelect);
  document.getElementById('clearFilesBtn').addEventListener('click', () => {
    window.clearAllPendingFiles();
  });
  
  // Settings dialog
  document.getElementById('closeSettingsBtn').addEventListener('click', settings.closeSettings);
  document.getElementById('settingsDialog').addEventListener('click', (e) => {
    if (e.target.id === 'settingsDialog') settings.closeSettings();
  });
  
  // Settings tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => settings.switchTab(btn.dataset.tab));
  });
  
  // Webhook settings
  document.getElementById('webhookExpand').addEventListener('click', settings.toggleWebhookExpand);
  document.getElementById('saveWebhookBtn').addEventListener('click', settings.saveWebhook);
  
  // Auth settings
  document.getElementById('authExpand').addEventListener('click', settings.toggleAuthExpand);
  document.getElementById('authSwitch').addEventListener('click', settings.toggleAuthEnabled);
  document.getElementById('authTypeSelect').addEventListener('change', settings.updateAuthFields);
  document.getElementById('saveAuthBtn').addEventListener('click', settings.saveAuthSettings);
  
  // TTS settings
  document.getElementById('ttsBytez').addEventListener('click', () => settings.setTTSProvider('bytez'));
  document.getElementById('ttsElevenlabs').addEventListener('click', () => settings.setTTSProvider('elevenlabs'));
  document.getElementById('addApiKeyBtn').addEventListener('click', settings.addApiKey);
  
  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('modeDropdown');
    const btn = document.getElementById('modeSelectorBtn');
    
    if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
      dropdown.classList.remove('open');
    }
  });
}
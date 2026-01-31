// UI Updates & Mode Switching
import { currentMode, setCurrentMode, isMicMuted, isProcessing } from './state.js';
import { CONFIG } from './config.js';

const modeIcons = {
  "text-answer": '<svg class="mode-option-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>',
  "text-to-voice": '<svg class="mode-option-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>',
  "voice-to-voice": '<svg class="mode-option-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>',
  "bob-live": '<svg class="mode-option-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>'
};

export function updateConnectionStatus() {
  const dot = document.getElementById('connectionDot');
  const text = document.getElementById('connectionText');
  const isConnected = !!CONFIG.webhookUrl;
  
  if (isConnected) {
    dot.classList.add('connected');
    text.textContent = 'connected';
  } else {
    dot.classList.remove('connected');
    text.textContent = 'disconnected';
  }
}

export function toggleModeDropdown() {
  document.getElementById('modeDropdown').classList.toggle('open');
}

export function setMode(mode) {
  setCurrentMode(mode);
  document.getElementById('modeDropdown').classList.remove('open');
  updateModeUI();
}

export function updateModeUI() {
  document.querySelectorAll('.mode-option').forEach(el => {
    el.classList.toggle('active', el.dataset.mode === currentMode);
  });
  
  const modeSelectorBtn = document.getElementById('modeSelectorBtn');
  modeSelectorBtn.innerHTML = modeIcons[currentMode];
  
  const isTextMode = currentMode === 'text-answer' || currentMode === 'text-to-voice';
  
  if (isTextMode) {
    const modeBtnWrapper = document.getElementById('modeBtnWrapper');
    modeBtnWrapper.appendChild(modeSelectorBtn);
    modeSelectorBtn.classList.remove('fixed-bottom');
  } else {
    document.body.appendChild(modeSelectorBtn);
    modeSelectorBtn.classList.add('fixed-bottom');
  }
  
  const messagesContainer = document.getElementById('messagesContainer');
  const voiceModeContent = document.getElementById('voiceModeContent');
  const chatContainer = document.getElementById('chatContainer');
  const voiceControls = document.getElementById('voiceControls');
  const orbContainer = document.getElementById('orbContainer');
  const voiceLevelContainer = document.getElementById('voiceLevelContainer');
  
  if (currentMode === 'text-answer') {
    messagesContainer.classList.add('visible');
    voiceModeContent.style.display = 'none';
    chatContainer.style.display = 'block';
  } else if (currentMode === 'bob-live') {
    messagesContainer.classList.remove('visible');
    voiceModeContent.style.display = 'flex';
    chatContainer.style.display = 'none';
    showToast('Bob Live mode - camera view would appear here', 'info');
  } else {
    messagesContainer.classList.remove('visible');
    voiceModeContent.style.display = 'flex';
    
    if (currentMode === 'voice-to-voice') {
      chatContainer.style.display = 'none';
      voiceControls.classList.add('visible');
      voiceLevelContainer.classList.add('visible');
      orbContainer.classList.add('high');
    } else {
      chatContainer.style.display = 'block';
      voiceControls.classList.remove('visible');
      voiceLevelContainer.classList.remove('visible');
      orbContainer.classList.remove('high');
    }
  }
  
  updateOrbState();
}

export function updateOrbState() {
  const isActive = isProcessing || !isMicMuted;
  
  document.getElementById('orbRingOuter').classList.toggle('active', isActive);
  document.getElementById('orbRingInner').classList.toggle('active', isActive);
  document.getElementById('orbBody').classList.toggle('active', isActive);
  document.getElementById('orbCenter').classList.toggle('active', isActive);
  
  document.getElementById('particle1').style.display = isActive ? 'block' : 'none';
  document.getElementById('particle2').style.display = isActive ? 'block' : 'none';
  document.getElementById('particle3').style.display = isActive ? 'block' : 'none';
}

export function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  
  setTimeout(() => toast.remove(), 3000);
}

export function updateSendButton() {
  const input = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');
  const voiceBtn = document.getElementById('voiceRecordBtn');
  
  const hasContent = input.value.trim() || window.pendingFiles?.length > 0;
  
  sendBtn.style.display = hasContent ? 'flex' : 'none';
  voiceBtn.style.display = (window.pendingFiles?.length || 0) === 0 ? 'flex' : 'none';
}
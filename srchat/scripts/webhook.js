// Webhook Communication
import { CONFIG, FIELD_CONTENT, FIELD_FILE } from './config.js';
import * as state from './state.js';
import { showToast, updateOrbState } from './ui.js';
import { addMessageToState } from './messages.js';
import { speakText } from './voice.js';
import { clearPendingFiles } from './state.js';
import { updatePendingFilesUI } from './files.js';
import { updateSendButton } from './ui.js';

export async function sendMessage() {
  const input = document.getElementById('messageInput');
  const message = input.value.trim();
  
  if (state.pendingFiles.length > 0) {
    for (let i = 0; i < state.pendingFiles.length; i++) {
      const pf = state.pendingFiles[i];
      const caption = i === 0 ? message : '';
      await sendFileToWebhook(pf.file, caption);
    }
    clearPendingFiles();
    updatePendingFilesUI();
    input.value = '';
    updateSendButton();
    return;
  }
  
  if (!message) return;
  
  if (!CONFIG.webhookUrl) {
    showToast('Please configure your webhook URL in settings', 'error');
    return;
  }
  
  state.setProcessing(true);
  state.setVoiceState('processing');
  updateOrbState();
  
  addMessageToState('user', message);
  input.value = '';
  updateSendButton();
  
  const formData = new FormData();
  formData.append(FIELD_CONTENT, message);
  
  await sendToWebhook(formData);
  
  state.setProcessing(false);
  state.setVoiceState('idle');
  updateOrbState();
}

export async function sendFileToWebhook(file, caption = '') {
  if (!CONFIG.webhookUrl) {
    showToast('Please configure your webhook URL in settings', 'error');
    return;
  }
  
  state.setProcessing(true);
  
  const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('audio/') ? 'audio' : 'file';
  const url = URL.createObjectURL(file);
  
  addMessageToState('user', caption || file.name, type, url, file.name);
  
  const formData = new FormData();
  formData.append(FIELD_FILE, file);
  formData.append(FIELD_CONTENT, caption || file.name);
  
  await sendToWebhook(formData);
  
  state.setProcessing(false);
}

export async function sendVoiceToWebhook(blob) {
  if (!CONFIG.webhookUrl) {
    showToast('Please configure your webhook URL in settings', 'error');
    return;
  }
  
  state.setProcessing(true);
  state.setVoiceState('processing');
  updateOrbState();
  
  addMessageToState('user', 'Voice message', 'audio', URL.createObjectURL(blob));
  
  const formData = new FormData();
  formData.append(FIELD_FILE, blob, 'recording.webm');
  formData.append(FIELD_CONTENT, 'Voice recording');
  
  await sendToWebhook(formData);
  
  state.setProcessing(false);
  state.setVoiceState('idle');
  updateOrbState();
}

async function sendToWebhook(formData) {
  try {
    const headers = {};
    
    if (CONFIG.auth.enabled) {
      if (CONFIG.auth.type === 'basic' && CONFIG.auth.username && CONFIG.auth.password) {
        headers['Authorization'] = `Basic ${btoa(`${CONFIG.auth.username}:${CONFIG.auth.password}`)}`;
      } else if (CONFIG.auth.type === 'header' && CONFIG.auth.headerKey && CONFIG.auth.headerValue) {
        headers[CONFIG.auth.headerKey] = CONFIG.auth.headerValue;
      } else if (CONFIG.auth.type === 'jwt' && CONFIG.auth.jwtToken) {
        headers['Authorization'] = `Bearer ${CONFIG.auth.jwtToken}`;
      }
    }
    
    const res = await fetch(CONFIG.webhookUrl, {
      method: 'POST',
      headers,
      body: formData
    });
    
    const result = await res.json();
    console.log('Webhook response:', result);
    
    const outputText = result?.output || result?.message || null;
    
    if (outputText) {
      addMessageToState('assistant', outputText);
      
      if (state.currentMode === 'text-to-voice' || state.currentMode === 'voice-to-voice') {
        document.getElementById('convertingIndicator').classList.add('visible');
        await speakText(outputText);
        document.getElementById('convertingIndicator').classList.remove('visible');
      }
    }
    
    return result;
    
  } catch (error) {
    console.error('Error sending to webhook:', error);
    showToast(error.message || 'Failed to send message', 'error');
    return null;
  }
}

export function handleKeyDown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}
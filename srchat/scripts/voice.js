// Voice Recording & TTS
import * as state from './state.js';
import { showToast, updateOrbState } from './ui.js';
import { sendVoiceToWebhook } from './webhook.js';

export async function toggleMic() {
  state.setMicMuted(!state.isMicMuted);
  const btn = document.getElementById('micToggleBtn');
  
  if (state.isMicMuted) {
    btn.textContent = 'Turn Mic ON';
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-destructive');
    stopRecordingVoice();
  } else {
    btn.textContent = 'Mute Mic';
    btn.classList.remove('btn-destructive');
    btn.classList.add('btn-primary');
    startRecordingVoice();
  }
  
  updateOrbState();
  updateVoiceStatus();
}

export async function startRecordingVoice() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    state.setAudioChunks([]);
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) state.audioChunks.push(e.data);
    };
    
    recorder.onstop = async () => {
      const blob = new Blob(state.audioChunks, { type: 'audio/webm' });
      stream.getTracks().forEach(track => track.stop());
      await sendVoiceToWebhook(blob);
    };
    
    recorder.start();
    state.setMediaRecorder(recorder);
    state.setRecording(true);
    document.getElementById('sendNowBtn').disabled = false;
    document.getElementById('listeningIndicator').classList.add('visible');
    
  } catch (error) {
    console.error('Failed to start recording:', error);
    showToast('Failed to access microphone', 'error');
  }
}

export function stopRecordingVoice() {
  if (state.mediaRecorder && state.isRecording) {
    state.mediaRecorder.stop();
    state.setRecording(false);
    document.getElementById('sendNowBtn').disabled = true;
    document.getElementById('listeningIndicator').classList.remove('visible');
  }
}

export function sendNow() {
  if (state.isRecording && state.currentMode === 'voice-to-voice') {
    stopRecordingVoice();
  }
}

export function updateVoiceStatus() {
  const status = document.getElementById('voiceStatus');
  const icon = document.getElementById('voiceStatusIcon');
  const text = document.getElementById('voiceStatusText');
  
  status.className = 'voice-status';
  
  if (state.voiceState === 'idle' || state.isMicMuted) {
    status.classList.remove('visible');
    return;
  }
  
  status.classList.add('visible', state.voiceState);
  
  const states = {
    calibrating: { icon: 'spinning', text: 'Calibrating silence level...' },
    hearing: { icon: 'pulsing', text: 'Hearing... speak now' },
    listening: { icon: 'pulsing', text: state.isMicMuted ? 'Microphone muted' : 'Listening...' },
    processing: { icon: 'spinning', text: 'Processing...' },
    speaking: { icon: 'pulsing', text: 'Speaking...' }
  };
  
  const stateInfo = states[state.voiceState];
  if (stateInfo) {
    icon.className = `voice-status-icon ${stateInfo.icon}`;
    text.textContent = stateInfo.text;
  }
}

export async function toggleVoiceRecord() {
  if (state.textModeRecording) {
    stopTextModeRecording();
  } else {
    startTextModeRecording();
  }
}

async function startTextModeRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    state.setTextModeChunks([]);
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) state.textModeChunks.push(e.data);
    };
    
    recorder.onstop = async () => {
      const blob = new Blob(state.textModeChunks, { type: 'audio/webm' });
      stream.getTracks().forEach(track => track.stop());
      await sendVoiceToWebhook(blob);
    };
    
    recorder.start();
    state.setTextModeRecorder(recorder);
    state.setTextModeRecording(true);
    
    const btn = document.getElementById('voiceRecordBtn');
    btn.classList.add('btn-destructive');
    btn.style.animation = 'pulse 1s infinite';
    
  } catch (error) {
    console.error('Failed to start recording:', error);
    showToast('Failed to access microphone', 'error');
  }
}

function stopTextModeRecording() {
  if (state.textModeRecorder && state.textModeRecording) {
    state.textModeRecorder.stop();
    state.setTextModeRecording(false);
    
    const btn = document.getElementById('voiceRecordBtn');
    btn.classList.remove('btn-destructive');
    btn.style.animation = '';
  }
}

export async function speakText(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    
    return new Promise((resolve) => {
      utterance.onend = resolve;
      utterance.onerror = resolve;
      speechSynthesis.speak(utterance);
    });
  }
  
  console.log('TTS not supported in this browser');
}

export function handleOrbClick() {
  console.log('Orb clicked - would pause/resume TTS');
}

export function toggleTextInput() {
  state.showTextInput = !state.showTextInput;
  showToast(state.showTextInput ? 'Text input enabled' : 'Text input disabled', 'info');
}
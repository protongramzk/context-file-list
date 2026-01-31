// Global Application State
export let currentMode = 'text-to-voice';
export let messages = [];
export let isProcessing = false;
export let voiceState = 'idle';
export let isMicMuted = true;
export let showTextInput = false;
export let pendingFiles = [];
export let isRecording = false;
export let mediaRecorder = null;
export let audioChunks = [];
export let textModeRecording = false;
export let textModeRecorder = null;
export let textModeChunks = [];

export function setCurrentMode(mode) {
  currentMode = mode;
  localStorage.setItem('currentMode', mode);
}

export function loadCurrentMode() {
  const saved = localStorage.getItem('currentMode');
  if (saved) currentMode = saved;
}

export function setProcessing(value) {
  isProcessing = value;
}

export function setVoiceState(state) {
  voiceState = state;
}

export function setMicMuted(value) {
  isMicMuted = value;
}

export function setRecording(value) {
  isRecording = value;
}

export function setMediaRecorder(recorder) {
  mediaRecorder = recorder;
}

export function setAudioChunks(chunks) {
  audioChunks = chunks;
}

export function setTextModeRecording(value) {
  textModeRecording = value;
}

export function setTextModeRecorder(recorder) {
  textModeRecorder = recorder;
}

export function setTextModeChunks(chunks) {
  textModeChunks = chunks;
}

export function addMessage(message) {
  messages.push(message);
}

export function addPendingFile(file) {
  pendingFiles.push(file);
}

export function removePendingFile(id) {
  const file = pendingFiles.find(pf => pf.id === id);
  if (file?.preview) URL.revokeObjectURL(file.preview);
  pendingFiles = pendingFiles.filter(pf => pf.id !== id);
}

export function clearPendingFiles() {
  pendingFiles.forEach(pf => {
    if (pf.preview) URL.revokeObjectURL(pf.preview);
  });
  pendingFiles = [];
}
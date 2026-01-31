// Message Rendering & Audio Playback
import { messages } from './state.js';

export function addMessageToState(role, content, type = 'text', fileUrl = null, fileName = null) {
  const msg = {
    id: Date.now().toString(),
    role,
    content,
    type,
    fileUrl,
    fileName,
    timestamp: Date.now()
  };
  
  messages.push(msg);
  renderMessages();
}

export function renderMessages() {
  const list = document.getElementById('messagesList');
  const scroll = document.getElementById('messagesScroll');
  
  messages.forEach((msg, index) => {
    if (!list.querySelector(`[data-index="${index}"]`)) {
      const messageContent = getMessageContent(msg);
      if (messageContent) {
        const el = document.createElement('div');
        el.className = `message ${msg.role}`;
        el.style.animationDelay = `${index * 0.1}s`;
        el.dataset.index = index;
        el.innerHTML = `
          <div class="message-bubble">
            ${messageContent}
          </div>
        `;
        list.appendChild(el);
      }
    }
  });
  
  scroll.scrollTop = scroll.scrollHeight;
}

function getMessageContent(msg) {
  switch (msg.type) {
    case 'text':
      return msg.content;
    case 'image':
      return `
        <img src="${msg.fileUrl}" alt="Shared" style="max-width: 100%; border-radius: 0.5rem;">
        ${msg.content ? `<p style="margin-top: 0.5rem; font-size: 0.875rem;">${msg.content}</p>` : ''}
      `;
    case 'audio':
      return `
        <div style="display: flex; align-items: center; gap: 0.75rem; min-width: 200px;">
          <button class="btn btn-ghost btn-icon" onclick="window.playAudio('${msg.fileUrl}')" style="border-radius: 50%;">
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </button>
          <div style="flex: 1; height: 2rem; background: hsla(220, 25%, 6%, 0.3); border-radius: 9999px;"></div>
        </div>
      `;
    case 'file':
      return `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <svg class="icon-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <div>
            <p style="font-weight: 500;">${msg.fileName || 'File'}</p>
            <p style="font-size: 0.75rem; opacity: 0.7;">${msg.content}</p>
          </div>
        </div>
      `;
    default:
      return '';
  }
}

export function playAudio(url) {
  const audio = new Audio(url);
  audio.play();
}

// Make playAudio globally accessible for onclick handlers
window.playAudio = playAudio;
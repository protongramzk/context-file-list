// File Upload & Preview Management
import { pendingFiles, addPendingFile, removePendingFile, clearPendingFiles } from './state.js';
import { updateSendButton } from './ui.js';

export function handleFileSelect(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;
  
  Array.from(files).forEach(file => {
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
    addPendingFile({
      file,
      preview,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });
  });
  
  updatePendingFilesUI();
  updateSendButton();
  event.target.value = '';
}

export function updatePendingFilesUI() {
  const container = document.getElementById('pendingFilesContainer');
  const list = document.getElementById('pendingFilesList');
  const count = document.getElementById('pendingFilesCount');
  
  if (pendingFiles.length === 0) {
    container.classList.remove('visible');
    return;
  }
  
  container.classList.add('visible');
  count.textContent = `${pendingFiles.length} file${pendingFiles.length > 1 ? 's' : ''} dipilih`;
  
  list.innerHTML = pendingFiles.map(pf => `
    <div class="pending-file">
      ${pf.preview 
        ? `<img src="${pf.preview}" alt="Preview" class="pending-file-preview">`
        : `<div class="pending-file-icon">
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span style="font-size: 0.5rem; color: var(--muted-foreground);">${pf.file.name.split('.').pop()?.toUpperCase() || 'FILE'}</span>
          </div>`
      }
      <button class="pending-file-remove" onclick="window.removePendingFileById('${pf.id}')">×</button>
    </div>
  `).join('') + `
    <button class="pending-file-add" onclick="document.getElementById('fileInput').click()">
      <svg class="icon-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
      </svg>
    </button>
  `;
}

export function removePendingFileById(id) {
  removePendingFile(id);
  updatePendingFilesUI();
  updateSendButton();
}

export function clearAllPendingFiles() {
  clearPendingFiles();
  updatePendingFilesUI();
  updateSendButton();
}

// Make functions globally accessible for onclick handlers
window.removePendingFileById = removePendingFileById;
window.clearAllPendingFiles = clearAllPendingFiles;
window.pendingFiles = pendingFiles;
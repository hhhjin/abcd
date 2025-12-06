// Display saved translation list and copy functionality in popup

const translationsList = document.getElementById('translations-list');
const emptyState = document.getElementById('empty-state');
const modelSelect = document.getElementById('model-select');
const headerActions = document.querySelector('.header-actions');
let copyAllBtn;
let deleteAllBtn;
const OLLAMA_API_URL = 'http://localhost:11434/api/tags';
let cachedTranslations = [];

// Simple inline icons for consistent rendering without external assets
const COPY_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy-icon lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
`;

const CHECK_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy-check-icon lucide-copy-check"><path d="m12 15 2 2 4-4"/><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
`;

const TRASH_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
`;

// Build header buttons dynamically so markup stays in JS
function createHeaderButtons() {
  if (!headerActions) {
    console.warn('Header actions container not found.');
    return;
  }

  headerActions.innerHTML = '';

  deleteAllBtn = document.createElement('button');
  deleteAllBtn.id = 'delete-all-btn';
  deleteAllBtn.className = 'icon-btn delete-all-btn';
  deleteAllBtn.title = 'Delete all translations';
  deleteAllBtn.setAttribute('aria-label', 'Delete all translations');
  deleteAllBtn.disabled = true;
  deleteAllBtn.innerHTML = TRASH_ICON;

  copyAllBtn = document.createElement('button');
  copyAllBtn.id = 'copy-all-btn';
  copyAllBtn.className = 'icon-btn copy-all-btn';
  copyAllBtn.title = 'Copy all translations';
  copyAllBtn.setAttribute('aria-label', 'Copy all translations');
  copyAllBtn.disabled = true;
  copyAllBtn.innerHTML = COPY_ICON;

  headerActions.append(deleteAllBtn, copyAllBtn);
}

// Load translation data from Chrome Storage
async function loadTranslations() {
  try {
    const result = await chrome.storage.local.get(['translations']);
    const translations = result.translations || [];
    cachedTranslations = translations;
    
    if (translations.length === 0) {
      translationsList.style.display = 'none';
      emptyState.style.display = 'block';
      if (copyAllBtn) {
        copyAllBtn.disabled = true;
        resetCopyButton(copyAllBtn, 'Copy all translations');
      }
      if (deleteAllBtn) {
        deleteAllBtn.disabled = true;
      }
      return;
    }
    
    translationsList.style.display = 'block';
    emptyState.style.display = 'none';
    if (copyAllBtn) {
      copyAllBtn.disabled = false;
      resetCopyButton(copyAllBtn, 'Copy all translations');
    }
    if (deleteAllBtn) {
      deleteAllBtn.disabled = false;
    }
    
    // Render list
    translationsList.innerHTML = translations.map((entry, index) => {
      const date = new Date(entry.timestamp);
      const dateStr = date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      return `
        <div class="translation-item" data-index="${index}">
          <div class="translation-header">
            <span class="timestamp">${dateStr}</span>
            <div class="translation-actions">
              <button
                class="icon-btn copy-pair-btn"
                data-original="${escapeHtml(entry.original)}"
                data-translated="${escapeHtml(entry.translated)}"
                aria-label="Copy pair"
                title="Copy pair"
              >${COPY_ICON}</button>
              <button
                class="icon-btn delete-pair-btn"
                data-index="${index}"
                aria-label="Delete this pair"
                title="Delete this pair"
              >${TRASH_ICON}</button>
            </div>
          </div>
          <div class="translation-content">
            <div class="text-block">
              <div class="text-label">Original</div>
              <div class="text-value original">${escapeHtml(entry.original)}</div>
            </div>
            <div class="text-block">
              <div class="text-label">Translation</div>
              <div class="text-value translated">${escapeHtml(entry.translated)}</div>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    // Add event listeners to copy and delete buttons
    document.querySelectorAll('.copy-pair-btn').forEach(btn => {
      btn.addEventListener('click', handleCopyPair);
    });
    document.querySelectorAll('.delete-pair-btn').forEach(btn => {
      btn.addEventListener('click', handleDeletePair);
    });
    
  } catch (error) {
    console.error('Error loading translations:', error);
    translationsList.innerHTML = '<div class="error">An error occurred while loading data.</div>';
  }
}

// Reset icon button to default copy state
function resetCopyButton(button, defaultLabel) {
  if (!button) return;
  button.innerHTML = COPY_ICON;
  button.classList.remove('copied');
  button.setAttribute('aria-label', defaultLabel);
  button.title = defaultLabel;
}

function showCopiedState(button, defaultLabel) {
  if (!button) return;
  button.innerHTML = CHECK_ICON;
  button.classList.add('copied');
  button.setAttribute('aria-label', 'Copied');
  button.title = 'Copied';
  setTimeout(() => {
    resetCopyButton(button, defaultLabel);
  }, 2000);
}

// HTML escape
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Format a single pair for clipboard usage
function formatPairText(entry, index) {
  const original = entry?.original || '';
  const translated = entry?.translated || '';
  return `- ${original}\n- ${translated}`;
}

// Copy original and translation together (single pair)
async function handleCopyPair(event) {
  const button = event.currentTarget;
  const original = button.getAttribute('data-original') || '';
  const translated = button.getAttribute('data-translated') || '';
  const combined = formatPairText({ original, translated }, parseInt(button.closest('.translation-item')?.dataset.index || '0', 10));
  
  try {
    await navigator.clipboard.writeText(combined);
    showCopiedState(button, 'Copy pair');
  } catch (error) {
    console.error('Copy both failed:', error);
    alert('Failed to copy both to clipboard.');
  }
}

// Copy all stored translations as pairs
async function handleCopyAll() {
  if (!copyAllBtn) return;
  
  if (!cachedTranslations || cachedTranslations.length === 0) {
    alert('No translations to copy.');
    return;
  }
  
  const combined = cachedTranslations
    .map((entry, index) => formatPairText(entry, index))
    .join('\n\n---\n\n');
  
  try {
    await navigator.clipboard.writeText(combined);
    showCopiedState(copyAllBtn, 'Copy all translations');
  } catch (error) {
    console.error('Copy all failed:', error);
    alert('Failed to copy all translations.');
  }
}

// Delete a single translation pair
async function handleDeletePair(event) {
  const button = event.currentTarget;
  const index = parseInt(button.dataset.index || '-1', 10);
  if (Number.isNaN(index) || index < 0) return;

  try {
    const result = await chrome.storage.local.get(['translations']);
    const translations = result.translations || [];
    if (index >= translations.length) return;

    translations.splice(index, 1);
    cachedTranslations = translations;
    await chrome.storage.local.set({ translations });
    loadTranslations();
  } catch (error) {
    console.error('Failed to delete pair:', error);
    alert('Failed to delete this pair.');
  }
}

// Delete all translation history
async function handleDeleteAll() {
  if (!deleteAllBtn || deleteAllBtn.disabled) return;

  try {
    // Optimistically update UI while storage clears
    deleteAllBtn.disabled = true;
    if (copyAllBtn) {
      copyAllBtn.disabled = true;
      resetCopyButton(copyAllBtn, 'Copy all translations');
    }
    translationsList.innerHTML = '';
    translationsList.style.display = 'none';
    emptyState.style.display = 'block';

    cachedTranslations = [];
    // Remove the key entirely to avoid stale data
    await chrome.storage.local.remove(['translations']);

    // Refresh from storage to keep in sync with any other listeners
    loadTranslations();
  } catch (error) {
    console.error('Failed to delete all translations:', error);
    alert('Failed to delete all translations.');
  }
}

// Fetch available models from Ollama API
async function fetchAvailableModels() {
  try {
    const response = await fetch(OLLAMA_API_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }
    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
}

// Load selected model from Chrome Storage
async function loadSelectedModel() {
  try {
    const result = await chrome.storage.local.get(['selectedModel']);
    return result.selectedModel || null;
  } catch (error) {
    console.error('Error loading selected model:', error);
    return null;
  }
}

// Save selected model to Chrome Storage
async function saveSelectedModel(modelName) {
  try {
    await chrome.storage.local.set({ selectedModel: modelName });
  } catch (error) {
    console.error('Error saving selected model:', error);
  }
}

// Populate model select dropdown
async function populateModelSelect() {
  const models = await fetchAvailableModels();
  const selectedModel = await loadSelectedModel();
  
  if (models.length === 0) {
    modelSelect.innerHTML = '<option value="">No models available</option>';
    return;
  }
  
  modelSelect.innerHTML = models.map(model => {
    const modelName = model.name || model.model || '';
    const selected = modelName === selectedModel ? 'selected' : '';
    return `<option value="${escapeHtml(modelName)}" ${selected}>${escapeHtml(modelName)}</option>`;
  }).join('');
  
  // If selected model is not in the list, add it as an option
  if (selectedModel && !models.some(m => (m.name || m.model) === selectedModel)) {
    const option = document.createElement('option');
    option.value = selectedModel;
    option.textContent = selectedModel;
    option.selected = true;
    modelSelect.insertBefore(option, modelSelect.firstChild);
  }
}

// Handle model selection change
modelSelect.addEventListener('change', async (event) => {
  const selectedModel = event.target.value;
  if (selectedModel) {
    await saveSelectedModel(selectedModel);
  }
});

createHeaderButtons();

// Copy all button listener
if (copyAllBtn) {
  copyAllBtn.addEventListener('click', handleCopyAll);
}

// Delete all button listener
if (deleteAllBtn) {
  deleteAllBtn.addEventListener('click', handleDeleteAll);
}

// Auto-refresh on storage changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.translations) {
    loadTranslations();
  }
  if (areaName === 'local' && changes.selectedModel) {
    // Update select to reflect the new selected model
    const newModel = changes.selectedModel.newValue;
    if (newModel && modelSelect.value !== newModel) {
      modelSelect.value = newModel;
    }
  }
});

// Initial load
loadTranslations();
populateModelSelect();


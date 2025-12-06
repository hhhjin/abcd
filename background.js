// Call Ollama API and save to Chrome Storage

const OLLAMA_API_URL = 'http://localhost:11434/api/generate';

// Remove the Origin header when calling Ollama so the local server does not reject the request.
async function registerOllamaCorsBypassRule() {
  try {
    const rule = {
      id: 1,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        // Strip Origin so Ollama sees this as a same-origin request,
        // and add the minimal ACA* headers so the browser accepts the response.
        requestHeaders: [{ header: 'origin', operation: 'remove' }],
        responseHeaders: [
          { header: 'access-control-allow-origin', operation: 'set', value: '*' },
          { header: 'access-control-allow-headers', operation: 'set', value: '*' },
          { header: 'access-control-allow-methods', operation: 'set', value: 'GET, POST, OPTIONS' }
        ]
      },
      condition: {
        urlFilter: 'http://localhost:11434/*',
        resourceTypes: ['xmlhttprequest']
      }
    };

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [rule.id],
      addRules: [rule]
    });
  } catch (error) {
    console.error('Failed to register Ollama CORS bypass rule:', error);
  }
}

// Register the header-mod rule when the background script loads
registerOllamaCorsBypassRule();

// Get selected model from Chrome Storage
async function getSelectedModel() {
  try {
    const result = await chrome.storage.local.get(['selectedModel']);
    return result.selectedModel || null;
  } catch (error) {
    console.error('Error loading selected model:', error);
    return null;
  }
}

// Request translation from Ollama API
async function translateText(text) {
  try {
    const model = await getSelectedModel();
    if (!model) {
      throw new Error('No model selected. Please select a model in the popup.');
    }
    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: `Translate the following text to English. Only return the translation, nothing else: ${text}`,
        stream: false
      })
    });

    if (!response.ok) {
      // Try to read error response body for more details
      let errorMessage = `Ollama API error: ${response.status}`;
      try {
        const errorData = await response.text();
        if (errorData) {
          errorMessage += ` - ${errorData}`;
        }
      } catch (e) {
        // If we can't read the error body, use the status code message
        console.error('Could not read error response body:', e);
      }
      
      // Provide user-friendly message for 403 errors
      if (response.status === 403) {
        errorMessage = 'Ollama 서버가 요청을 거부했습니다. Ollama를 실행할 때 OLLAMA_ORIGINS=* 또는 chrome-extension://<확장ID> 를 허용하도록 설정했는지 확인하세요.';
      }
      
      console.error('Ollama API error details:', {
        status: response.status,
        statusText: response.statusText,
        url: OLLAMA_API_URL
      });
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    // Extract translated text based on Ollama API response format
    const translated = data.response || data.text || '';
    return translated.trim();
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

// Save to Chrome Storage
async function saveTranslation(original, translated) {
  try {
    const result = await chrome.storage.local.get(['translations']);
    const translations = result.translations || [];
    
    const newEntry = {
      timestamp: Date.now(),
      original: original,
      translated: translated
    };
    
    // Add new entry at the beginning (most recent first)
    translations.unshift(newEntry);
    
    // Store maximum 100 entries (optional)
    if (translations.length > 100) {
      translations = translations.slice(0, 100);
    }
    
    await chrome.storage.local.set({ translations: translations });
    return newEntry;
  } catch (error) {
    console.error('Storage error:', error);
    throw error;
  }
}

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'TRANSLATE_TEXT') {
    const text = request.text;
    
    // Async processing
    translateText(text)
      .then(translated => {
        return saveTranslation(text, translated);
      })
      .then(entry => {
        sendResponse({ success: true, entry: entry });
      })
      .catch(error => {
        console.error('Error in translation flow:', error);
        sendResponse({ success: false, error: error.message });
      });
    
    // Return true for async response
    return true;
  }
});

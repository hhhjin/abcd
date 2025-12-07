// Call Ollama API and save to Chrome Storage

const OLLAMA_API_URL = 'http://localhost:11434/api/generate'

interface OllamaGenerateRequest {
	model: string
	prompt: string
	stream: boolean
}

interface OllamaGenerateResponse {
	response?: string
	text?: string
}

interface TranslationEntry {
	timestamp: number
	original: string
	translated: string
	targetLang: string
}

interface TranslateRequest {
	type: 'TRANSLATE_TEXT'
	text: string
	targetLanguages?: string | string[]
}

interface TranslateResponse {
	success: boolean
	entries?: TranslationEntry[]
	error?: string
}

// Remove the Origin header when calling Ollama so the local server does not reject the request.
async function registerOllamaCorsBypassRule(): Promise<void> {
	try {
		const rule: chrome.declarativeNetRequest.Rule = {
			id: 1,
			priority: 1,
			action: {
				type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
				// Strip Origin so Ollama sees this as a same-origin request,
				// and add the minimal ACA* headers so the browser accepts the response.
				requestHeaders: [
					{
						header: 'origin',
						operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE,
					},
				],
				responseHeaders: [
					{
						header: 'access-control-allow-origin',
						operation: chrome.declarativeNetRequest.HeaderOperation.SET,
						value: '*',
					},
					{
						header: 'access-control-allow-headers',
						operation: chrome.declarativeNetRequest.HeaderOperation.SET,
						value: '*',
					},
					{
						header: 'access-control-allow-methods',
						operation: chrome.declarativeNetRequest.HeaderOperation.SET,
						value: 'GET, POST, OPTIONS',
					},
				],
			},
			condition: {
				urlFilter: 'http://localhost:11434/*',
				resourceTypes: [
					chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
				],
			},
		}

		await chrome.declarativeNetRequest.updateDynamicRules({
			removeRuleIds: [rule.id],
			addRules: [rule],
		})
	} catch (error) {
		console.error('Failed to register Ollama CORS bypass rule:', error)
	}
}

// Register the header-mod rule when the background script loads
registerOllamaCorsBypassRule()

// Get selected model from Chrome Storage
async function getSelectedModel(): Promise<string | null> {
	try {
		const result = await chrome.storage.local.get(['selectedModel'])
		return (result.selectedModel as string | undefined) || null
	} catch (error) {
		console.error('Error loading selected model:', error)
		return null
	}
}

function normalizeTargetLanguages(list: unknown): string[] {
	if (!Array.isArray(list)) return ['English']
	const cleaned = list
		.map((lang) => (typeof lang === 'string' ? lang.trim() : ''))
		.filter((lang): lang is string => Boolean(lang))
	const unique = Array.from(new Set(cleaned))
	return unique.length > 0 ? unique : ['English']
}

// Request translation from Ollama API
async function translateText(
	text: string,
	targetLang: string = 'English',
): Promise<string> {
	try {
		const model = await getSelectedModel()
		if (!model) {
			throw new Error('No model selected. Please select a model in the popup.')
		}
		const requestBody: OllamaGenerateRequest = {
			model: model,
			prompt: `Translate the following text to ${targetLang}. Preserve the original tone and nuance of the message as much as possible. Only return the translation, nothing else: ${text}`,
			stream: false,
		}

		const response = await fetch(OLLAMA_API_URL, {
			method: 'POST',
			mode: 'cors',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(requestBody),
		})

		if (!response.ok) {
			// Try to read error response body for more details
			let errorMessage = `Ollama API error: ${response.status}`
			try {
				const errorData = await response.text()
				if (errorData) {
					errorMessage += ` - ${errorData}`
				}
			} catch (e) {
				// If we can't read the error body, use the status code message
				console.error('Could not read error response body:', e)
			}

			// Provide user-friendly message for 403 errors
			if (response.status === 403) {
				errorMessage =
					'Ollama 서버가 요청을 거부했습니다. Ollama를 실행할 때 OLLAMA_ORIGINS=* 또는 chrome-extension://<확장ID> 를 허용하도록 설정했는지 확인하세요.'
			}

			console.error('Ollama API error details:', {
				status: response.status,
				statusText: response.statusText,
				url: OLLAMA_API_URL,
			})

			throw new Error(errorMessage)
		}

		const data = (await response.json()) as OllamaGenerateResponse
		// Extract translated text based on Ollama API response format
		const translated = data.response || data.text || ''
		return translated.trim()
	} catch (error) {
		console.error('Translation error:', error)
		throw error
	}
}

// Save to Chrome Storage
async function saveTranslation(
	original: string,
	translated: string,
	targetLang: string = 'English',
): Promise<TranslationEntry> {
	try {
		const result = await chrome.storage.local.get(['translations'])
		let translations =
			(result.translations as TranslationEntry[] | undefined) || []

		const newEntry: TranslationEntry = {
			timestamp: Date.now(),
			original: original,
			translated: translated,
			targetLang: targetLang,
		}

		// Add new entry at the beginning (most recent first)
		translations.unshift(newEntry)

		// Store maximum 100 entries (optional)
		if (translations.length > 100) {
			translations = translations.slice(0, 100)
		}

		await chrome.storage.local.set({ translations: translations })
		return newEntry
	} catch (error) {
		console.error('Storage error:', error)
		throw error
	}
}

// Message listener
chrome.runtime.onMessage.addListener(
	(
		request: unknown,
		_sender: chrome.runtime.MessageSender,
		sendResponse: (response: TranslateResponse) => void,
	): boolean => {
		const translateRequest = request as TranslateRequest
		if (translateRequest.type === 'TRANSLATE_TEXT') {
			const text = translateRequest.text
			const targetLanguages = normalizeTargetLanguages(
				translateRequest.targetLanguages,
			)

			Promise.all(
				targetLanguages.map(async (lang) => {
					const translated = await translateText(text, lang)
					return saveTranslation(text, translated, lang)
				}),
			)
				.then((entries) => {
					sendResponse({ success: true, entries })
				})
				.catch((error) => {
					console.error('Error in translation flow:', error)
					const errorMessage =
						error instanceof Error ? error.message : 'Unknown error'
					sendResponse({ success: false, error: errorMessage })
				})

			// Return true for async response
			return true
		}
		return false
	},
)

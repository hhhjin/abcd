// Detect all inputs and textareas on web pages and capture submit events

interface WindowWithExtension extends Window {
	translationExtensionInitialized?: boolean
}

;(() => {
	const win = window as WindowWithExtension

	// Check if already initialized
	if (win.translationExtensionInitialized) {
		return
	}
	win.translationExtensionInitialized = true

	async function getSelectedLanguages(): Promise<string[]> {
		try {
			const result = await chrome.storage.local.get(['selectedLanguage'])
			const selectedLanguage = result.selectedLanguage as string | undefined
			if (selectedLanguage && typeof selectedLanguage === 'string') {
				return [selectedLanguage]
			}
		} catch (error) {
			console.error(error)
		}
		return ['English']
	}

	async function sendTranslationRequest(text: string): Promise<void> {
		const targetLanguages = await getSelectedLanguages()
		chrome.runtime.sendMessage({
			type: 'TRANSLATE_TEXT',
			text,
			targetLanguages,
		})
	}

	// Form submit event listener
	function handleFormSubmit(event: Event): void {
		const form = event.target as HTMLFormElement
		const inputs = form.querySelectorAll<
			HTMLInputElement | HTMLTextAreaElement
		>('input[type="text"], input[type="search"], textarea')

		inputs.forEach((input) => {
			const value = input.value.trim()
			if (value) {
				sendTranslationRequest(value)
			}
		})
	}

	// Detect Enter key submission
	function handleKeyDown(event: KeyboardEvent): void {
		if (event.key === 'Enter' && !event.shiftKey) {
			const target = event.target as HTMLElement
			if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
				const inputElement = target as HTMLInputElement | HTMLTextAreaElement
				const value = inputElement.value.trim()
				if (value) {
					// Add slight delay to capture before actual submit
					setTimeout(() => {
						sendTranslationRequest(value)
					}, 100)
				}
			} else if (target.isContentEditable) {
				const value = target.textContent?.trim() ?? ''
				if (value) {
					// Add slight delay to capture before actual submit
					setTimeout(() => {
						sendTranslationRequest(value)
					}, 100)
				}
			}
		}
	}

	// Add event listeners to all forms on the page
	function attachListeners(): void {
		// Existing forms
		document.querySelectorAll('form').forEach((form) => {
			form.addEventListener('submit', handleFormSubmit)
		})

		// MutationObserver for dynamically added forms
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				mutation.addedNodes.forEach((node) => {
					if (node.nodeType === 1) {
						// Element node
						const element = node as Element
						if (element.tagName === 'FORM') {
							element.addEventListener('submit', handleFormSubmit)
						}
						// Also detect inputs added inside forms
						element.querySelectorAll?.('form').forEach((form) => {
							form.addEventListener('submit', handleFormSubmit)
						})
					}
				})
			})
		})

		observer.observe(document.body, {
			childList: true,
			subtree: true,
		})

		// Enter key event listener
		document.addEventListener('keydown', handleKeyDown, true)
	}

	// Add listeners when DOM is ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () =>
			setTimeout(attachListeners, 1000),
		)
	} else {
		setTimeout(attachListeners, 1000)
	}
})()

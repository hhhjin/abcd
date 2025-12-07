import { useChromeStorage } from './use-chrome-storage'

export interface Translation {
	original: string
	translated: string
	targetLang: string
	timestamp: number
}

export function useTranslations() {
	const [translations, setTranslations, isLoading] = useChromeStorage<
		Translation[]
	>('translations', [])

	const deleteTranslation = async (index: number) => {
		const newTranslations = [...translations]
		newTranslations.splice(index, 1)
		await setTranslations(newTranslations)
	}

	const deleteAllTranslations = async () => {
		await setTranslations([])
	}

	const formatPairText = (entry: Translation) => {
		const { original, translated } = entry
		return `- ${original}\n- ${translated}`
	}

	const copyPair = async (entry: Translation) => {
		const text = formatPairText(entry)
		await navigator.clipboard.writeText(text)
	}

	const copyAll = async () => {
		if (translations.length === 0) return
		const combined = translations.map(formatPairText).join('\n\n---\n\n')
		await navigator.clipboard.writeText(combined)
	}

	return {
		translations,
		isLoading,
		deleteTranslation,
		deleteAllTranslations,
		copyPair,
		copyAll,
	}
}

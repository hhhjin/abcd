import { useEffect, useMemo } from 'react'
import { DEFAULT_LANGUAGES } from '../lib/language-names'
import { useChromeStorage } from './use-chrome-storage'

export function useLanguages() {
	const [storedSelected, setStoredSelected] = useChromeStorage<string>(
		'selectedLanguage',
		'English',
	)

	const languages = useMemo(() => {
		return DEFAULT_LANGUAGES
	}, [])

	const selectedLanguage = useMemo(() => {
		const selected = storedSelected || 'English'
		return languages.includes(selected) ? selected : 'English'
	}, [storedSelected, languages])

	// Sync selected language when languages change
	useEffect(() => {
		if (!languages.includes(selectedLanguage)) {
			setStoredSelected('English')
		}
	}, [languages, selectedLanguage, setStoredSelected])

	const setSelectedLanguage = async (lang: string) => {
		if (languages.includes(lang)) {
			await setStoredSelected(lang)
		}
	}

	return {
		languages,
		selectedLanguage,
		setSelectedLanguage,
	}
}

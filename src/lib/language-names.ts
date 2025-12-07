/**
 * Mapping from English language names to their native names
 */
const LANGUAGE_NAME_MAP: Record<string, string> = {
	English: 'English',
	Korean: '한국어',
	Japanese: '日本語',
	Chinese: '中文',
	Spanish: 'Español',
	French: 'Français',
	German: 'Deutsch',
	Italian: 'Italiano',
	Portuguese: 'Português',
	Russian: 'Русский',
	Arabic: 'العربية',
	Hindi: 'हिन्दी',
	Turkish: 'Türkçe',
	Dutch: 'Nederlands',
	Polish: 'Polski',
	Vietnamese: 'Tiếng Việt',
	Thai: 'ไทย',
	Indonesian: 'Bahasa Indonesia',
	Swedish: 'Svenska',
	Norwegian: 'Norsk',
	Danish: 'Dansk',
	Finnish: 'Suomi',
	Greek: 'Ελληνικά',
	Hebrew: 'עברית',
	Czech: 'Čeština',
	Romanian: 'Română',
	Hungarian: 'Magyar',
	Ukrainian: 'Українська',
}

/**
 * Default list of supported languages, derived from the language name map
 * This serves as the single source of truth for all language-related data
 */
export const DEFAULT_LANGUAGES = Object.keys(LANGUAGE_NAME_MAP) as Array<
	keyof typeof LANGUAGE_NAME_MAP
>

/**
 * Returns the native name for a language, or falls back to the English name if not found
 */
export function getNativeLanguageName(lang: string): string {
	return LANGUAGE_NAME_MAP[lang] || lang
}

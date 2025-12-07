import { useLanguages } from '../hooks/use-language'
import { getNativeLanguageName } from '../lib/language-names'
import { Label } from './ui/label'
import {
	Select,
	SelectItem,
	SelectPopup,
	SelectTrigger,
	SelectValue,
} from './ui/select'

export function LanguageSelector() {
	const { languages, selectedLanguage, setSelectedLanguage } = useLanguages()

	return (
		<div className="space-y-2">
			<Label htmlFor="language-select">Target Language:</Label>
			<Select
				value={selectedLanguage || ''}
				onValueChange={(value) => {
					if (value) {
						setSelectedLanguage(value)
					}
				}}
			>
				<SelectTrigger id="language-select" className="w-full">
					<SelectValue>
						{selectedLanguage ? getNativeLanguageName(selectedLanguage) : ''}
					</SelectValue>
				</SelectTrigger>
				<SelectPopup>
					{languages.map((lang) => (
						<SelectItem key={lang} value={lang}>
							{getNativeLanguageName(lang)}
						</SelectItem>
					))}
				</SelectPopup>
			</Select>
		</div>
	)
}

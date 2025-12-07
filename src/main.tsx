import './global.css'
import ReactDOM from 'react-dom/client'
import { LanguageSelector } from './components/language-selector'
import { ModelSelector } from './components/model-selector'
import { TranslationList } from './components/translation-list'

function App() {
	return (
		<div className="w-[500px] min-h-screen bg-background text-foreground p-6 flex flex-col gap-6">
			<header className="flex flex-col gap-1">
				<h1 className="text-xl font-semibold tracking-tight">AI Translator</h1>
				<p className="text-sm text-muted-foreground">
					Translate text seamlessly using local LLMs.
				</p>
			</header>

			<main className="flex-1 flex flex-col gap-6">
				<div className="grid grid-cols-2 gap-4">
					<ModelSelector />
					<LanguageSelector />
				</div>

				<div className="space-y-3">
					<TranslationList />
				</div>
			</main>
		</div>
	)
}

const root = document.getElementById('root')
if (root) {
	ReactDOM.createRoot(root).render(<App />)
}

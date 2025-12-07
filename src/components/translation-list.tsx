import { Check, Copy, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from '../hooks/use-translations'
import { cn } from '../lib/utils'
import { TranslationItem } from './translation-item'
import { Button } from './ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from './ui/empty'

export function TranslationList() {
	const {
		translations,
		isLoading,
		deleteTranslation,
		deleteAllTranslations,
		copyPair,
		copyAll,
	} = useTranslations()
	const [copiedAll, setCopiedAll] = useState(false)

	const handleCopyAll = async () => {
		if (translations.length === 0) return
		await copyAll()
		setCopiedAll(true)
		setTimeout(() => setCopiedAll(false), 2000)
	}

	const handleDeleteAll = async () => {
		if (translations.length === 0) return
		if (confirm('Are you sure you want to delete all translations?')) {
			await deleteAllTranslations()
		}
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="text-sm text-muted-foreground">Loading...</div>
			</div>
		)
	}

	if (translations.length === 0) {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyTitle>No translations saved yet.</EmptyTitle>
					<EmptyDescription>
						Start translating to see your history here.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		)
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
					Recent Translations
				</div>
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="sm"
						onClick={handleCopyAll}
						disabled={translations.length === 0}
						className={cn(
							'h-7 text-xs gap-1.5 transition-colors',
							copiedAll
								? 'text-green-600 hover:text-green-700 font-medium'
								: 'text-muted-foreground hover:text-foreground',
						)}
					>
						{copiedAll ? (
							<Check className="size-3.5" />
						) : (
							<Copy className="size-3.5" />
						)}
						{copiedAll ? 'Copied' : 'Copy All'}
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={handleDeleteAll}
						disabled={translations.length === 0}
						className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-destructive"
					>
						<Trash2 className="size-3.5" />
						Clear
					</Button>
				</div>
			</div>

			<div className="flex flex-col">
				{translations.map((translation, index) => (
					<TranslationItem
						key={`${translation.timestamp}-${index}`}
						translation={translation}
						index={index}
						onCopy={copyPair}
						onDelete={deleteTranslation}
					/>
				))}
			</div>
		</div>
	)
}

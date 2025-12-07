import { Check, Copy, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { Translation } from '../hooks/use-translations'
import { getNativeLanguageName } from '../lib/language-names'
import { cn } from '../lib/utils'
import { Button } from './ui/button'

interface TranslationItemProps {
	translation: Translation
	index: number
	onCopy: (translation: Translation) => Promise<void>
	onDelete: (index: number) => Promise<void>
}

export function TranslationItem({
	translation,
	index,
	onCopy,
	onDelete,
}: TranslationItemProps) {
	const [copied, setCopied] = useState(false)

	const handleCopy = async () => {
		await onCopy(translation)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	const handleDelete = async () => {
		await onDelete(index)
	}

	return (
		<div className="group flex flex-col gap-2 py-4 first:pt-0 border-b border-border/40 last:border-0 relative">
			<div className="flex items-start justify-between gap-4">
				<div className="flex-1 space-y-1">
					<div className="text-xs text-muted-foreground">Original</div>
					<div className="text-sm text-foreground/90 font-medium leading-relaxed">
						{translation.original}
					</div>
				</div>

				<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 top-3 bg-background/80 backdrop-blur-sm p-1 rounded-md shadow-sm border border-border/50">
					<Button
						variant="ghost"
						size="icon"
						onClick={handleCopy}
						aria-label="Copy pair"
						title="Copy pair"
						className={cn('h-7 w-7', copied && 'text-green-600')}
					>
						{copied ? (
							<Check className="size-3.5" />
						) : (
							<Copy className="size-3.5" />
						)}
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={handleDelete}
						aria-label="Delete this pair"
						title="Delete this pair"
						className="h-7 w-7 text-muted-foreground hover:text-destructive"
					>
						<Trash2 className="size-3.5" />
					</Button>
				</div>
			</div>

			<div className="flex-1 space-y-1">
				<div className="text-xs text-muted-foreground">Translation</div>
				<div className="text-sm text-foreground leading-relaxed">
					{translation.translated}
				</div>
				<div className="flex items-center gap-2 text-xs text-muted-foreground/80">
					<span>{getNativeLanguageName(translation.targetLang)}</span>
				</div>
			</div>
		</div>
	)
}

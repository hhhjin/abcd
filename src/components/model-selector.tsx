import { useModels } from '../hooks/use-models'
import { Label } from './ui/label'
import {
	Select,
	SelectItem,
	SelectPopup,
	SelectTrigger,
	SelectValue,
} from './ui/select'

export function ModelSelector() {
	const { models, selectedModel, setSelectedModel } = useModels()

	return (
		<div className="space-y-2">
			<Label htmlFor="model-select">Ollama Model:</Label>
			<Select
				value={selectedModel || ''}
				onValueChange={(value) => {
					if (value) {
						setSelectedModel(value)
					}
				}}
			>
				<SelectTrigger id="model-select" className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectPopup>
					{models.map((model) => (
						<SelectItem key={model} value={model}>
							{model}
						</SelectItem>
					))}
					{selectedModel && !models.includes(selectedModel) && (
						<SelectItem value={selectedModel}>{selectedModel}</SelectItem>
					)}
				</SelectPopup>
			</Select>
		</div>
	)
}

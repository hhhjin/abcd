import { useEffect, useState } from 'react'
import { useChromeStorage } from './use-chrome-storage'

const OLLAMA_API_URL = 'http://localhost:11434/api/tags'

interface OllamaModel {
	name?: string
	model?: string
}

export function useModels() {
	const [selectedModel, setSelectedModel] = useChromeStorage<string | null>(
		'selectedModel',
		null,
	)
	const [models, setModels] = useState<OllamaModel[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const fetchModels = async () => {
			try {
				const response = await fetch(OLLAMA_API_URL)
				if (!response.ok) {
					throw new Error(`Failed to fetch models: ${response.status}`)
				}
				const data = await response.json()
				setModels(data.models || [])
			} catch (error) {
				console.error('Error fetching models:', error)
				setModels([])
			} finally {
				setIsLoading(false)
			}
		}

		fetchModels()
	}, [])

	const modelNames = models.map((m) => m.name || m.model || '').filter(Boolean)

	return {
		models: modelNames,
		selectedModel,
		setSelectedModel,
		isLoading,
	}
}

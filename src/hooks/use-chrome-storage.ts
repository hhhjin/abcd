import { useEffect, useState } from 'react'

export function useChromeStorage<T>(key: string, initialValue: T) {
	const [value, setValue] = useState<T>(initialValue)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		// Load initial value
		chrome.storage.local.get([key]).then((result) => {
			const storedValue = result[key] ?? initialValue
			setValue(storedValue)
			setIsLoading(false)
		})

		// Listen for changes
		const listener = (
			changes: { [key: string]: chrome.storage.StorageChange },
			areaName: string,
		) => {
			if (areaName === 'local' && changes[key]) {
				setValue(changes[key].newValue ?? initialValue)
			}
		}

		chrome.storage.onChanged.addListener(listener)

		return () => {
			chrome.storage.onChanged.removeListener(listener)
		}
	}, [key, initialValue])

	const setStorageValue = async (newValue: T) => {
		setValue(newValue)
		await chrome.storage.local.set({ [key]: newValue })
	}

	return [value, setStorageValue, isLoading] as const
}

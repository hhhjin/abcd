# English Study Chrome Extension

A Chrome extension that detects text input in web page inputs/textarea, translates them to English using Ollama API, saves them, and allows you to view and copy the translations from the extension popup.

## Installation

1. Open Chrome browser and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select this project folder

## Requirements

- Ollama must be installed and running (default: `http://localhost:11434`)
- A translation model must be installed in Ollama (default: `llama2`)

### Installing Ollama Model (Example)

```bash
ollama pull llama2
```

Or modify the `OLLAMA_MODEL` variable in `background.js` if using a different model.

## Icon Setup (Optional)

The `manifest.json` references icon files. To add icons:
- `icon16.png` (16x16)
- `icon48.png` (48x48)
- `icon128.png` (128x128)

Add these files to the project root, or remove the icon-related settings from `manifest.json`.

## Usage

1. Type text in an input or textarea on any web page
2. Press Enter or submit the form
3. Click the extension icon to view translation history
4. Click the "Copy" button on original or translated text to copy to clipboard

## Features

- Automatic detection of all input/textarea on web pages
- Automatic translation via Ollama API (any language → English)
- Save translation history to Chrome Storage
- View translation history list in popup
- Individual copy functionality for original/translated text
- Real-time updates (automatically reflects when new translations are added)

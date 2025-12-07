# Translation Chrome Extension

A Chrome extension that detects text input in web page inputs/textarea, translates them to your selected target language(s) using Ollama API, saves them, and allows you to view and copy the translations from the extension popup.

## Development Setup

### Prerequisites

1. **Install Node.js**
   - Download and install Node.js from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **Install pnpm**
   - Install pnpm globally: `npm install -g pnpm`
   - Verify installation: `pnpm --version`

### Build Steps

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Build the extension:
   ```bash
   pnpm build
   ```

3. The built files will be in the `dist/` directory

## Installation

1. Build the extension (see Development Setup above)
2. Open Chrome browser and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select this project folder

## Requirements

- Ollama must be installed and running (default: `http://localhost:11434`)
- A translation model must be installed in Ollama (you can select any model in the extension popup)

### Installing Ollama Model

Install any translation-capable model in Ollama, for example:

```bash
ollama pull llama2
# or
ollama pull llama3
# or any other model that supports translation
```

After installation, select the model from the dropdown in the extension popup.

## Icon Setup (Optional)

The `manifest.json` references icon files. To add icons:
- `icon16.png` (16x16)
- `icon48.png` (48x48)
- `icon128.png` (128x128)

Add these files to the project root, or remove the icon-related settings from `manifest.json`.

## Usage

1. Select a translation model from the dropdown in the extension popup
2. Select your target language(s) from the language selector
3. Type text in an input or textarea on any web page
4. Press Enter or submit the form
5. Click the extension icon to view translation history
6. Click the "Copy" button on original or translated text to copy to clipboard

## Features

- Automatic detection of all input/textarea on web pages
- Automatic translation via Ollama API to your selected target language(s)
- Support for multiple target languages (translate to multiple languages at once)
- Save translation history to Chrome Storage
- View translation history list in popup
- Individual copy functionality for original/translated text
- Real-time updates (automatically reflects when new translations are added)
- Language names displayed in their native language (e.g., 한국어, 日本語, Español)

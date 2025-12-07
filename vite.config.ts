import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Plugin to move popup.html from dist/src/ to dist/ and fix paths for Chrome extension
function movePopupHtml() {
	return {
		name: 'move-popup-html',
		closeBundle() {
			const srcPath = resolve(__dirname, 'dist/src/popup.html')
			const destPath = resolve(__dirname, 'dist/popup.html')
			if (existsSync(srcPath)) {
				let content = readFileSync(srcPath, 'utf-8')
				// Fix paths for Chrome extension: /assets/ -> ./assets/
				// Since dist/popup.html is in dist/, and assets are in dist/assets/,
				// we need relative paths
				content = content.replace(/src="\/assets\//g, 'src="./assets/')
				content = content.replace(/href="\/assets\//g, 'href="./assets/')
				writeFileSync(destPath, content, 'utf-8')
				unlinkSync(srcPath)
			}
		},
	}
}

export default defineConfig({
	plugins: [react(), tailwindcss(), movePopupHtml()],
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src'),
		},
	},
	build: {
		outDir: 'dist',
		rollupOptions: {
			input: {
				popup: resolve(__dirname, 'src/popup.html'),
				content: resolve(__dirname, 'content-script/content-script.ts'),
				background: resolve(__dirname, 'background/background.ts'),
			},
			output: {
				entryFileNames: 'assets/[name].js',
				chunkFileNames: 'assets/[name].js',
				assetFileNames: 'assets/[name].[ext]',
			},
		},
	},
})

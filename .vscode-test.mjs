import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: 'test/**/*.test.js',
	launchArgs: [
		'--disable-gpu',
		'--disable-software-rasterizer',
		'--disable-dev-shm-usage',
		'--no-sandbox',
		'--disable-setuid-sandbox',
		'--disable-web-security',
		'--disable-features=VizDisplayCompositor'
	],
	extensionDevelopmentPath: '.',
	extensionTestsPath: './test'
});

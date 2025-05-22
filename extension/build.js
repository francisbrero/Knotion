import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

// Ensure dist/icons directory exists
const iconsDir = path.join(distDir, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

// Build popup.js
await esbuild.build({
  entryPoints: [path.join(__dirname, 'popup.js')],
  outfile: path.join(distDir, 'popup.js'),
  bundle: true,
  minify: true,
  platform: 'browser',
  target: ['chrome58'],
});

// Build contentScript.js
await esbuild.build({
  entryPoints: [path.join(__dirname, 'src/contentScript.ts')],
  outfile: path.join(distDir, 'contentScript.js'),
  bundle: true,
  minify: true,
  platform: 'browser',
  target: ['chrome58'],
});

// Copy manifest.json
fs.copyFileSync(
  path.join(__dirname, 'manifest.json'),
  path.join(distDir, 'manifest.json')
);

// Copy popup.html
fs.copyFileSync(
  path.join(__dirname, 'popup.html'),
  path.join(distDir, 'popup.html')
);

// Copy contentStyle.css
fs.copyFileSync(
  path.join(__dirname, 'src/contentStyle.css'),
  path.join(distDir, 'contentStyle.css')
);

// Create placeholder icons (1x1 transparent PNGs)
// In a real project, you would replace these with actual icons
const placeholderIconSizes = [16, 48, 128];
placeholderIconSizes.forEach(size => {
  // This is just a simple placeholder - in reality, you'd want real icons
  const placeholderIcon = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
  fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), placeholderIcon);
});

console.log('Extension build completed successfully! Output directory: ./extension/dist'); 
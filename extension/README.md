# KNotion Chrome Extension

A simple Chrome extension that allows you to save the current page to your KNotion account with one click.

## Development

### Prerequisites
- Node.js and pnpm installed
- KNotion backend running locally on port 3000 (or update the API_BASE_URL in popup.js)

### Building the Extension
```bash
# From the project root
pnpm extension:build
```

This will create a `dist` directory in the `extension` folder with the built extension.

### Installing the Extension in Chrome
1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `extension/dist` directory
4. The extension should now appear in your Chrome toolbar

### Usage
1. Login to your KNotion account using the web interface
2. Click the KNotion extension icon
3. Click "Save Current Page" to save the current tab's URL to your KNotion account

## Production Deployment
Before deploying to production, make sure to:
1. Update the `API_BASE_URL` in popup.js to point to your production server
2. Replace the placeholder icons with real ones
3. Package the extension for the Chrome Web Store 
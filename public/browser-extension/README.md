# Feedback Capture Browser Extension

A Chrome/Edge extension that lets you quickly capture feedback from anywhere and sync it to your Feedback Analyzer app.

## Installation

1. Download the `browser-extension` folder from your deployed app's `/browser-extension/` URL
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the `browser-extension` folder

## Usage

1. Click the extension icon in your browser toolbar
2. Type your feedback in the text area
3. Press "Save Feedback" or Ctrl+Enter
4. The feedback is saved with default values:
   - Theme: Other
   - Importance: Medium
   - Business Alignment: 3
   - Cost: Medium
   - Source: Browser Extension

5. Open your Feedback Analyzer app to see and edit the captured feedback

## Features

- Quick feedback capture from any webpage
- Auto-syncs to your database (works across devices)
- Keyboard shortcut: Ctrl+Enter to submit
- Dark theme that matches the main app

## Note

The extension connects directly to your backend. All feedback captured through the extension will appear in your main Feedback Analyzer app automatically.

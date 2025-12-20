# Gemini Nano Flow - Chrome Extension

A high-performance bulk image generation engine designed to unlock Gemini's creative potential at scale. This Chrome extension works on both `gemini.google.com` and `aistudio.google.com`.

## Features

- **Queue Engine**: Batch process multiple prompts with automatic queue management
- **Style Library**: Organize and reuse prompt templates in folders
- **AI Prompt Optimization**: Let Gemini improve your prompts automatically
- **Multi-Model Support**: Switch between Flash 2.0 (fast) and Imagen 3 (high fidelity)
- **Reference Images**: Include images as reference for your generations
- **CSV Import**: Bulk import prompts from CSV files
- **Side Panel UI**: Non-intrusive side panel that doesn't interfere with your workflow

## Installation

### Development

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Run in development mode**:

   ```bash
   npm run dev
   ```

   This will start the WXT development server with hot reload.

3. **Load the extension in Chrome**:
   - Open `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `.output/chrome-mv3` folder

### Production Build

```bash
npm run build
```

The built extension will be in `.output/chrome-mv3`.

### Create ZIP for Distribution

```bash
npm run zip
```

## Usage

1. **Configure API Key**:

   - Click the extension icon or go to Options
   - Enter your Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

2. **Open Side Panel**:

   - Navigate to `gemini.google.com` or `aistudio.google.com`
   - Click the extension icon to open the side panel
   - Or use keyboard shortcut: `Ctrl+Shift+G` (Windows) / `Cmd+Shift+G` (Mac)

3. **Queue Prompts**:

   - Enter prompts in the text area (one per line or comma-separated)
   - Optionally add reference images
   - Click "Enqueue" to add to the queue

4. **Start Generation**:
   - Click "Ignite Engine" to start processing the queue
   - View results as they complete
   - Download individual images or wait for batch completion

## Project Structure

```
src/
├── entrypoints/
│   ├── background.ts         # Service worker for message handling
│   ├── sidepanel/            # Side panel React app
│   ├── options/              # Options page for settings
│   ├── gemini.content.ts     # Content script for gemini.google.com
│   └── aistudio.content.ts   # Content script for aistudio.google.com
├── components/               # Reusable React components
├── services/                 # API and storage services
├── hooks/                    # React hooks
├── types/                    # TypeScript types
└── assets/                   # Styles and static assets
```

## Technology Stack

- **Framework**: [WXT](https://wxt.dev/) - Modern web extension framework
- **UI**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API via `@google/genai`
- **Storage**: Chrome Storage API

## Development

### Prerequisites

- Node.js 18+
- npm or pnpm

### Commands

| Command                 | Description              |
| ----------------------- | ------------------------ |
| `npm run dev`           | Start development server |
| `npm run build`         | Build for production     |
| `npm run zip`           | Create distribution ZIP  |
| `npm run dev:firefox`   | Development for Firefox  |
| `npm run build:firefox` | Build for Firefox        |

### Icon Generation

To generate PNG icons from the SVG sources:

```bash
npm install sharp --save-dev
node scripts/generate-icons.js
```

## Configuration

The extension stores configuration in `chrome.storage.local`:

- **API Key**: Your Gemini API key (stored securely)
- **Queue**: Current generation queue
- **Settings**: User preferences (theme, model, prompts)
- **Folders**: Style library organization

## Keyboard Shortcuts

| Shortcut               | Action          |
| ---------------------- | --------------- |
| `Ctrl/Cmd + Shift + G` | Open Side Panel |

## Permissions

The extension requires the following permissions:

- `storage`: Save settings and queue locally
- `sidePanel`: Display the side panel UI
- `activeTab`: Detect when on supported sites
- `tabs`: Open side panel on supported pages
- Host permissions for `gemini.google.com` and `aistudio.google.com`

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues and feature requests, please open an issue on GitHub.

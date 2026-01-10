# Nano Flow - Chrome Extension

A powerful batch processing extension for Google Gemini. Queue multiple prompts, attach reference images, and let Nano Flow automate your creative workflow.

## Features

### Core Functionality

- **Batch Queue Processing**: Add multiple prompts and process them automatically through Gemini
- **Multi-Tool Support**: Generate with Image, Video, Canvas, Deep Research, Learning, or Visual Layout tools
- **Reference Images**: Attach multiple images per prompt as references for better generation results
- **Smart Prompt Parsing**: Enter prompts separated by blank lines - each paragraph becomes a queue item

### CSV Import

- **Bulk Import**: Upload CSV files with prompts, tool types, and image references
- **Cloud URLs**: Reference images via HTTP/HTTPS URLs directly in your CSV
- **Local Files**: Upload local image files and map them to CSV references
- **Multiple Images**: Support for multiple reference images per prompt (separated by `|` or `;`)

### Template Library

- **Folder Organization**: Organize prompts into folders for easy access
- **Template Reuse**: Save and reuse your favorite prompts with attached images
- **AI Optimization**: Let AI improve your prompts automatically (requires API key)
- **Bulk Improvement**: Optimize all templates in a folder at once

### Prompt Enhancement

- **Global Prefix/Suffix**: Automatically add text to all prompts
- **Global Negatives**: Add "NOT" clauses to exclude unwanted elements
- **Text Weighting**: Select text and apply emphasis weights (1.2x, 1.5x, or echo)

### User Experience

- **Interactive Onboarding**: Step-by-step guided tour highlighting each feature
- **Resizable Sidebar**: Drag to resize the panel (280-600px)
- **Position Control**: Place the sidebar on the left or right side
- **Light/Dark Theme**: Match your preference or system setting
- **Real-time Progress**: Track processing time and queue status

### Advanced Settings

- **Drip-Feed Mode**: Add random delays between prompts to avoid rate limits
- **Auto-Stop on Error**: Optionally stop processing when errors occur
- **Model Selection**: Choose between different Gemini models

## Installation

### From Chrome Web Store

*(Coming soon)*

### Development Build

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Run in development mode**:

   ```bash
   npm run dev
   ```

   This starts the WXT development server with hot reload.

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

### Getting Started

1. Navigate to `gemini.google.com`
2. The Nano Flow sidebar will appear automatically
3. Follow the interactive onboarding tour (or skip it)

### Adding Prompts

1. **Manual Entry**: Type prompts in the text area, separated by blank lines
2. **CSV Import**: Click the upload icon to import from CSV
3. **Templates**: Use saved templates from the Library tab

### Attaching Images

1. Click the camera icon to attach reference images
2. Select one or multiple images
3. Images will be shown as thumbnails in the input area
4. All attached images are included with each prompt

### Processing the Queue

1. Select your desired tool (Image, Video, Canvas, etc.)
2. Click "Add to Queue" or press `Ctrl+Enter`
3. Click the "Start" button to begin processing
4. Watch results appear in real-time

### CSV Format

```csv
Prompt,Type,Images
"A cyberpunk city at night",image,
"A dragon breathing fire",image,https://example.com/dragon-ref.jpg
"Transform this photo",image,photo1.jpg
"Combine these styles",image,style1.jpg|style2.jpg
```

**Columns:**
- **Prompt** (required): The prompt text (use quotes for commas)
- **Type** (optional): image, video, canvas, research, learning, layout
- **Images** (optional): URLs or local filenames, separated by `|` or `;`

## Project Structure

```
src/
├── entrypoints/
│   ├── background.ts              # Service worker for message handling
│   ├── gemini.content/            # Content script with sidebar UI
│   │   ├── index.tsx              # Main sidebar component
│   │   ├── automation.ts          # Gemini page automation
│   │   └── style.css              # Component styles
│   ├── sidepanel/                 # Side panel React app
│   ├── options/                   # Options page for settings
│   └── popup/                     # Browser action popup
├── components/
│   ├── QueuePanel.tsx             # Queue management UI
│   ├── TemplatesPanel.tsx         # Template library UI
│   ├── SettingsPanel.tsx          # Settings configuration
│   ├── OnboardingModal.tsx        # Interactive tour
│   ├── CsvDialog.tsx              # CSV import dialog
│   └── ...                        # Other components
├── services/
│   ├── storageService.ts          # Chrome storage management
│   └── promptOptimizationService.ts # AI prompt improvement
├── types/                         # TypeScript type definitions
└── assets/                        # Icons and static assets
```

## Technology Stack

- **Framework**: [WXT](https://wxt.dev/) - Modern web extension framework
- **UI**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API via `@google/genai`
- **Icons**: Lucide React
- **Storage**: Chrome Storage API

## Development

### Prerequisites

- Node.js 18+
- npm, pnpm, or bun

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

- **Queue**: Current generation queue with status
- **Settings**: User preferences (theme, position, model, prefix/suffix)
- **Folders**: Template library organization
- **Onboarding**: Tour completion status

## Keyboard Shortcuts

| Shortcut           | Action                   |
| ------------------ | ------------------------ |
| `Ctrl/Cmd + Enter` | Add prompts to queue     |
| `Enter`            | Submit in input dialogs  |

## Permissions

The extension requires the following permissions:

- `storage`: Save settings and queue locally
- `sidePanel`: Display the side panel UI
- `activeTab`: Detect when on supported sites
- `tabs`: Open side panel on supported pages
- Host permissions for `gemini.google.com` and `aistudio.google.com`

## Privacy

Nano Flow operates entirely locally in your browser. Your prompts, images, and settings are stored in Chrome's local storage and are never sent to external servers (except when using the AI optimization feature with your own API key).

See our [Privacy Policy](./PRIVACY.md) for more details.

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues and feature requests, please open an issue on GitHub.

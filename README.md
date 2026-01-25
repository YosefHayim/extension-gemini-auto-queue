# Nano Flow

> A production-grade Chrome Extension for batch queue processing on Google Gemini, built with modern web technologies and engineering best practices.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![Chrome MV3](https://img.shields.io/badge/Chrome-MV3-4285F4?logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

## Technical Highlights

| Category | Implementation |
|----------|----------------|
| **Type Safety** | TypeScript strict mode with `noImplicitAny`, zero `any` tolerance |
| **Architecture** | Clean separation: `backend/` (services, utils) + `extension/` (UI, entrypoints) |
| **State Management** | React Query + Custom Hooks pattern |
| **Code Quality** | ESLint strict type-checked rules + Prettier |
| **Extension Framework** | WXT (modern Vite-based extension framework) |
| **Styling** | Tailwind CSS with consistent design tokens |

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Code Quality Standards](#code-quality-standards)
- [Features](#features)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development](#development)
- [Contributing](#contributing)

---

## Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Chrome Extension (MV3)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐    chrome.runtime     ┌──────────────────────┐   │
│  │  Side Panel  │◄────────────────────► │  Background Service  │   │
│  │  (React App) │       messages        │      (Worker)        │   │
│  └──────────────┘                       └──────────┬───────────┘   │
│                                                     │               │
│                                        chrome.tabs.sendMessage      │
│                                                     │               │
│                                         ┌───────────▼───────────┐   │
│                                         │    Content Script     │   │
│                                         │   (DOM Automation)    │   │
│                                         └───────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **UI Layer** (Side Panel) - React components with custom hooks for state
2. **Message Layer** - Type-safe Chrome runtime messaging
3. **Service Layer** - Business logic, storage, and API integrations
4. **Automation Layer** - Content script for DOM interactions

### Storage Strategy

| Storage Type | Use Case | Implementation |
|--------------|----------|----------------|
| `chrome.storage.local` | Settings, folders, templates | `storageService.ts` |
| `IndexedDB` | Queue items with images (large payloads) | `queueDb.ts` |
| `chrome.storage.session` | Processing state (survives SW restarts) | Direct API |

---

## Tech Stack

### Core

| Technology | Version | Purpose |
|------------|---------|---------|
| [TypeScript](https://www.typescriptlang.org/) | 5.8 | Type-safe JavaScript |
| [React](https://react.dev/) | 18.3 | UI component library |
| [WXT](https://wxt.dev/) | 0.19 | Chrome Extension framework |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4 | Utility-first styling |

### UI Libraries

| Library | Purpose |
|---------|---------|
| [@tanstack/react-query](https://tanstack.com/query) | Async state management |
| [@radix-ui](https://www.radix-ui.com/) | Accessible UI primitives |
| [@dnd-kit](https://dndkit.com/) | Drag and drop |
| [Lucide React](https://lucide.dev/) | Icon system |
| [Sonner](https://sonner.emilkowal.ski/) | Toast notifications |

### Development Tools

| Tool | Purpose |
|------|---------|
| [ESLint](https://eslint.org/) | Code linting with strict TypeScript rules |
| [Prettier](https://prettier.io/) | Code formatting |
| [Vite](https://vitejs.dev/) | Build tooling (via WXT) |
| [pnpm](https://pnpm.io/) | Fast, disk-efficient package manager |

---

## Code Quality Standards

### TypeScript Configuration

```jsonc
// tsconfig.json - Strict mode enabled
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### ESLint Rules

The project enforces strict type safety with zero tolerance for `any`:

```javascript
// Key ESLint rules enforced
"@typescript-eslint/no-explicit-any": "error",
"@typescript-eslint/no-unsafe-assignment": "error",
"@typescript-eslint/no-unsafe-member-access": "error",
"@typescript-eslint/no-unsafe-call": "error",
"@typescript-eslint/no-unsafe-return": "error",
"@typescript-eslint/consistent-type-imports": "error",
```

### Import Organization

Imports are automatically sorted and grouped:

```typescript
// 1. External libraries
import React from "react";
import { useQuery } from "@tanstack/react-query";

// 2. Internal modules
import { QueuePanel } from "@/components/QueuePanel";
import { useQueue } from "@/hooks/useQueue";

// 3. Types (separate import statement)
import type { QueueItem, AppSettings } from "@/types";
```

### React Patterns

```typescript
// Props interface pattern with clear organization
interface QueueItemCardProps {
  // Data props
  item: QueueItem;
  
  // Required callbacks (on* prefix)
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  
  // Optional callbacks
  onEdit?: (id: string, newPrompt: string) => void;
}

// Functional component with TypeScript
export const QueueItemCard: React.FC<QueueItemCardProps> = ({
  item,
  onRemove,
  onRetry,
  onEdit,
}) => {
  // Implementation
};
```

### Custom Hooks Pattern

```typescript
// Encapsulated state logic with clear return types
export function useQueue() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addToQueue = useCallback((items: QueueItem[]) => {
    // Implementation
  }, []);

  return {
    queue,
    isProcessing,
    addToQueue,
    // ... other methods
  };
}
```

---

## Features

### Core Functionality

- **Batch Queue Processing** - Add multiple prompts, process automatically
- **Multi-Tool Support** - Image, Video, Canvas, Deep Research, Learning, Visual Layout
- **Reference Images** - Attach multiple images per prompt
- **Smart Parsing** - Paragraphs auto-convert to queue items

### Data Management

- **CSV Import** - Bulk import with cloud URLs and local file mapping
- **Template Library** - Organized folders with AI optimization
- **Export Options** - JSON/CSV export with filtering

### User Experience

- **Interactive Onboarding** - Guided feature tour
- **Drag & Drop** - Reorder queue items
- **Dark/Light Theme** - System preference support
- **Keyboard Shortcuts** - `Ctrl+Enter` to add, etc.

### Advanced Features

- **Drip-Feed Mode** - Random delays to avoid rate limits
- **Scheduling** - Process queue at specific times
- **Retry Logic** - Exponential backoff with jitter
- **Error Recovery** - Auto-stop and resume capabilities

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/gemini-nano-flow.git
cd gemini-nano-flow

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Load in Chrome

1. Navigate to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `.output/chrome-mv3`

### Production Build

```bash
# Build for production
pnpm build

# Create distribution ZIP
pnpm zip
```

---

## Project Structure

```
src/
├── backend/                    # Business logic layer
│   ├── services/               # Storage, API, queue management
│   │   ├── storageService.ts   # Chrome storage abstraction
│   │   ├── queueDb.ts          # IndexedDB for queue items
│   │   └── geminiService.ts    # Gemini API integration
│   ├── types/                  # TypeScript type definitions
│   │   └── index.ts            # Centralized type exports
│   └── utils/                  # Utility functions
│       ├── retryStrategy.ts    # Exponential backoff
│       ├── imageProcessor.ts   # Image manipulation
│       └── logger.ts           # Structured logging
│
├── extension/                  # Chrome extension layer
│   ├── entrypoints/            # WXT entry points
│   │   ├── background/         # Service worker (modular)
│   │   │   ├── index.ts        # Main entry
│   │   │   ├── messageHandlers.ts
│   │   │   ├── processing.ts
│   │   │   └── state.ts
│   │   ├── sidepanel/          # Main UI (React)
│   │   │   ├── App.tsx
│   │   │   ├── hooks/          # Page-specific hooks
│   │   │   └── components/     # Page-specific components
│   │   ├── gemini.content/     # Content script
│   │   │   ├── automation/     # DOM automation
│   │   │   └── modules/        # Feature modules
│   │   ├── popup/              # Browser action
│   │   └── options/            # Options page
│   ├── components/             # Shared React components
│   │   ├── queue-panel/
│   │   ├── settings-panel/
│   │   ├── templates-panel/
│   │   └── bulk-actions/
│   └── hooks/                  # Shared React hooks
│       ├── useQueue.ts
│       ├── useStorage.ts
│       └── useAuth.ts
│
└── assets/                     # Static assets
    └── icons/                  # Extension icons
```

---

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with hot reload |
| `pnpm build` | Production build |
| `pnpm zip` | Create distribution ZIP |
| `pnpm validate` | Run typecheck + lint + format check |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Fix ESLint issues |
| `pnpm format` | Format with Prettier |
| `pnpm typecheck` | TypeScript type checking |

### Code Validation

Before committing, ensure all checks pass:

```bash
pnpm validate
```

This runs:
1. `tsc --noEmit` - Type checking
2. `eslint .` - Linting
3. `prettier --check` - Format verification

### Browser Support

| Browser | Support |
|---------|---------|
| Chrome | Full (MV3) |
| Firefox | Partial (via `pnpm dev:firefox`) |
| Edge | Full (Chromium-based) |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Ensure code passes validation (`pnpm validate`)
4. Commit with clear messages
5. Push and create a Pull Request

### Code Standards

- Follow existing TypeScript patterns
- No `any` types - use proper typing
- Use `import type` for type-only imports
- Write self-documenting code with clear naming

---

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

## Privacy

Nano Flow operates entirely locally. Your prompts, images, and settings are stored in Chrome's local storage and are never sent to external servers (except when using AI optimization with your own API key).

See [Privacy Policy](./PRIVACY.md) for details.

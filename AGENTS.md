# GEMINI NANO FLOW - PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-15T21:23:00Z
**Commit:** e7155dc
**Branch:** main

## OVERVIEW

Chrome extension (MV3) for batch queue processing on Gemini. WXT framework + React 18 + TypeScript strict mode. Automates prompt submission, tool/mode selection, and media download.

## STRUCTURE

```
src/
├── entrypoints/           # Extension entry points (WXT convention)
│   ├── background.ts      # Service worker: queue processing, scheduling, message routing
│   ├── gemini.content/    # Content script: DOM automation for gemini.google.com
│   ├── sidepanel/         # Main UI: React app in Chrome side panel
│   ├── popup/             # Browser action popup
│   └── options/           # Options page
├── components/            # React components (17 files, see subdir AGENTS.md)
├── services/              # Business logic: storage, queue, API
├── hooks/                 # React hooks: useQueue, useStorage, useFormSubmit
├── utils/                 # Utilities: DOM, timing, image processing, retry
└── types/                 # TypeScript definitions: QueueItem, AppSettings, enums
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add new message type | `src/types/index.ts` (MessageType enum) → `src/entrypoints/background.ts` (handler) | Update both |
| Modify queue processing | `src/entrypoints/background.ts` → `startProcessing()` | Main loop lines 407-569 |
| Add UI component | `src/components/` | Follow props interface pattern |
| Add Gemini page automation | `src/entrypoints/gemini.content/modules/` | Create new module, export from index |
| Modify storage schema | `src/types/index.ts` (type) → `src/services/storageService.ts` (defaults) | Update DEFAULT_SETTINGS |
| Add retry logic | `src/utils/retryStrategy.ts` | Exponential backoff with jitter |

## ARCHITECTURE

### Extension Contexts

```
┌─────────────────┐     chrome.runtime.sendMessage     ┌──────────────────┐
│   Side Panel    │ ◄──────────────────────────────────► │ Background (SW)  │
│   (React App)   │                                      │ (Service Worker) │
└─────────────────┘                                      └────────┬─────────┘
                                                                  │
                                                    chrome.tabs.sendMessage
                                                                  │
                                                                  ▼
                                                         ┌────────────────┐
                                                         │ Content Script │
                                                         │ (DOM Automation)│
                                                         └────────────────┘
```

### Message Flow

1. UI sends `MessageType.*` to background via `chrome.runtime.sendMessage`
2. Background handles in `handleMessage()` switch statement
3. For DOM operations, background forwards to content script via `sendToContentScript()`
4. Content script executes automation, returns result

### Storage Architecture

- **Settings/Folders**: `chrome.storage.local` via `storageService.ts`
- **Queue Items**: IndexedDB via `queueDb.ts` (handles large payloads with images)
- **Processing State**: `chrome.storage.session` (survives service worker restarts)

## CONVENTIONS

### TypeScript (STRICT)

- `noImplicitAny: true` - No `any` types allowed
- `import type {}` syntax required for type-only imports
- Path alias: `@/*` → `./src/*`

### ESLint Rules

- Console: Only `warn`/`error` allowed (no `log` in production)
- Imports: Strict ordering (builtin → external → internal → parent → sibling)
- React: Self-closing components, no curly braces in JSX

### React Components

```typescript
// Props interface pattern
interface ComponentProps {
  item: QueueItem;          // Data props first
  isDark: boolean;          // Theme prop (required everywhere)
  onAction: () => void;     // Callbacks use on* prefix
  onEdit?: () => void;      // Optional callbacks marked with ?
}
```

### Styling

- Tailwind CSS with dark mode via `isDark` prop ternary
- Color system: emerald (success), blue (processing), red (error), amber (pending)
- Hover states: `group` + `group-hover:opacity-100` pattern

## ANTI-PATTERNS (THIS PROJECT)

| Pattern | Why Forbidden |
|---------|---------------|
| `as any`, `@ts-ignore` | Strict TypeScript mode enforced |
| `console.log()` | Use `logger.module()` from `@/utils` |
| Direct DOM manipulation in components | Use content script modules |
| Manual `tasks.json` edits | Use `task-master` commands |
| Re-running `task-master init` | No-op; use `parse-prd` instead |

## COMPLEXITY HOTSPOTS

| File | Lines | Issue |
|------|-------|-------|
| `src/entrypoints/sidepanel/App.tsx` | 1,373 | Prompt parsing (198-273), state sync |
| `src/components/BulkActionsDialog.tsx` | 1,117 | 8 action types, complex conditionals |
| `src/components/QueuePanel.tsx` | 1,008 | Drag-drop, filtering, memoization |
| `src/entrypoints/background.ts` | 588 | Processing loop (407-569), retry logic |

## COMMANDS

```bash
pnpm dev              # Start dev server with hot reload
pnpm build            # Production build → .output/chrome-mv3/
pnpm zip              # Create distribution ZIP
pnpm validate         # typecheck + lint + format:check
pnpm generate-icons   # SVG → PNG icon conversion
```

## TESTING

**NO TEST FRAMEWORK INSTALLED.** Validation via:
- TypeScript strict mode (`pnpm typecheck`)
- ESLint strict rules (`pnpm lint`)
- Manual testing on gemini.google.com

## NOTES

- **Service Worker Restarts**: Processing state persisted in `chrome.storage.session`
- **Content Script Injection**: Background auto-injects if not responding to PING
- **Rate Limiting**: Use `dripFeed` setting (8-15s delays) for heavy usage
- **Image Storage**: Queue images stored as base64 in IndexedDB (quota ~50MB)
- **Scheduling**: Uses `chrome.alarms` API with `SCHEDULE_ALARM_NAME`

# src/entrypoints/gemini.content - Gemini Page Automation

## OVERVIEW

Content script injected into gemini.google.com. Handles DOM automation for prompt submission, tool/mode selection, image upload, and generation detection.

## STRUCTURE

```
gemini.content/
├── index.ts           # Entry point, initializes automationModule
├── automation.ts      # Message handler, orchestrates modules
└── modules/
    ├── index.ts              # Re-exports all modules
    ├── promptInput.ts        # Paste text into prompt field
    ├── toolSelection.ts      # Select Gemini tool (Image, Video, Canvas...)
    ├── modeSelection.ts      # Select mode (Fast, Thinking, Pro)
    ├── generationDetection.ts # Detect when generation completes
    └── networkMonitor.ts     # Monitor network requests
```

## AUTOMATION FLOW

```
1. selectMode(mode)           # Optional: Switch Fast/Thinking/Pro
       ↓
2. selectTool(tool)           # Click tool button (Image, Video, etc.)
       ↓
3. uploadImages(images)       # Optional: Upload reference images
       ↓
4. pastePromptToInput(prompt) # Insert text into input field
       ↓
5. submitPrompt()             # Click send button
       ↓
6. waitForGenerationComplete() # Poll for completion indicators
```

## KEY FUNCTIONS

### promptInput.ts

```typescript
pastePromptToInput(prompt: string): Promise<boolean>
// Finds rich-text-editor, sets innerHTML, dispatches input event
// Falls back to execCommand for older browsers
```

### toolSelection.ts

```typescript
selectTool(tool: GeminiTool): Promise<boolean>
// Clicks tool button by data-test-id
// Tool IDs: bard-image-tool, bard-video-tool, bard-canvas-tool...
```

### modeSelection.ts

```typescript
selectMode(mode: GeminiMode): Promise<boolean>
// Opens mode dropdown, clicks mode option
// Modes: bard-mode-option-fast, bard-mode-option-thinking, bard-mode-option-pro
```

### generationDetection.ts

```typescript
waitForGenerationComplete(tool: GeminiTool, timeout?: number): Promise<void>
// Polls for completion indicators (tool-specific)
// Image: Check for generated images in response
// Video: Check for video player element
// Default: Check for response container
```

## DOM SELECTORS

Located in `src/utils/selectors.ts`:

```typescript
SELECTORS = {
  PROMPT_INPUT: '[data-test-id="bard-text-input"]',
  SEND_BUTTON: '[data-test-id="send-button"]',
  TOOL_BUTTON: (tool) => `[data-test-id="bard-${tool}-tool"]`,
  MODE_DROPDOWN: '[data-test-id="bard-mode-selector"]',
  // ... more selectors
}
```

## WHERE TO LOOK

| Task | File | Notes |
|------|------|-------|
| Fix broken selector | `src/utils/selectors.ts` | Update data-test-id values |
| Add new tool | `modules/toolSelection.ts` + `types/index.ts` | Add to GeminiTool enum |
| Change detection logic | `modules/generationDetection.ts` | Modify poll conditions |
| Debug automation | `automation.ts` | Uses logger module |

## ANTI-PATTERNS

- Never use `document.querySelector` directly - use `findElement` from `@/utils/dom`
- Never hardcode selectors - use `SELECTORS` constant
- Never skip error logging - automation failures should log with `logger.warn`

## NOTES

- Selectors may break when Gemini updates UI - check `data-test-id` attributes
- Image upload uses hidden file input + programmatic click
- Generation timeout defaults to 5 minutes (300000ms)

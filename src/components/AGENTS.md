# src/components - React UI Components

## OVERVIEW

17 React components using props-based composition, callback-heavy architecture, Tailwind CSS styling.

## STRUCTURE

```
components/
├── QueuePanel.tsx          # Queue display, drag-drop, filtering (1,008 lines)
├── QueueItemCard.tsx       # Individual queue item with edit mode (594 lines)
├── BulkActionsDialog.tsx   # 8 bulk action types (1,117 lines)
├── TemplatesPanel.tsx      # Template library + folders (649 lines)
├── SettingsPanel.tsx       # App settings configuration
├── SearchFilter.tsx        # Multi-filter search (tool, mode, content)
├── ScheduleButton.tsx      # Schedule processing with date picker
├── StatusBadge.tsx         # Color-coded status indicator
├── OnboardingModal.tsx     # Interactive feature tour
├── CsvDialog.tsx           # CSV import for bulk prompts
├── ExportDialog.tsx        # Export queue to JSON/CSV
├── BulkDownloadDialog.tsx  # Download generated media
├── AIOptimizationDialog.tsx # AI prompt improvement
├── ApiKeyDialog.tsx        # API key configuration
├── Tooltip.tsx             # Reusable tooltip
├── Footer.tsx              # Footer branding
└── download/               # Download-related components
    ├── DownloadOptionsDialog.tsx
    ├── AdvancedOptionsPanel.tsx
    ├── FormatSelector.tsx
    └── PresetSelector.tsx
```

## COMPONENT PATTERNS

### Props Interface Convention

```typescript
interface ComponentProps {
  // 1. Data props
  item: QueueItem;
  queue: QueueItem[];
  
  // 2. Theme prop (REQUIRED on all components)
  isDark: boolean;
  
  // 3. Required callbacks
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  
  // 4. Optional callbacks
  onEdit?: (id: string, newPrompt: string) => void;
  
  // 5. Optional state
  isEditing?: boolean;
}
```

### Dialog Pattern

```typescript
// All dialogs follow this pattern
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  // ... additional props
}

// Early return when closed
if (!isOpen) return null;
```

### File Upload Pattern

```typescript
const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files ?? []);
  Promise.all(files.map(file => 
    new Promise<string>(resolve => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    })
  )).then(base64Files => {
    // Update state
  });
};
```

## STYLING CONVENTIONS

### Dark Mode

```typescript
// ALWAYS use isDark prop for theme
className={`${isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"}`}
```

### Status Colors

| Status | Color |
|--------|-------|
| Pending | `amber-500` |
| Processing | `blue-500 animate-pulse` |
| Completed | `emerald-500` |
| Failed | `red-500` |

### Hover Reveal

```typescript
<div className="group">
  <button className="opacity-0 group-hover:opacity-100">Action</button>
</div>
```

## WHERE TO LOOK

| Task | File | Notes |
|------|------|-------|
| Add new bulk action | `BulkActionsDialog.tsx` | Add to `actionButtons` array, create handler |
| Add queue filter | `SearchFilter.tsx` + `QueuePanel.tsx` | Update `filteredQueue` memo |
| New dialog | Create file, follow DialogProps pattern | Add to `App.tsx` state |
| Add status type | `StatusBadge.tsx` + `types/index.ts` | Update `statusStyles` map |

## ANTI-PATTERNS

- No global state (Redux/Context) - use callback props
- No inline styles - use Tailwind classes
- No direct state mutation - always spread and update

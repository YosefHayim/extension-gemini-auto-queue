# Nano Flow UI Implementation - Learnings

## Project Conventions
- All components receive `isDark: boolean` prop for theme support
- Use Tailwind CSS classes (no inline styles)
- Status colors: amber-500 (pending), blue-500 (processing), emerald-500 (completed), red-500 (failed)
- Follow DialogProps interface pattern for dialogs
- No global state - use callback props pattern

## Design Reference
- Design file: `/Applications/Github/extension-gemini-auto-queue/gemini-nano-flow-extension.pen`
- All screens at 380px width (extension standard)

## Architecture Notes
- WXT framework for Chrome extension
- React 18 + TypeScript strict mode
- Storage via `services/storageService.ts`
- Queue state in Chrome storage
## [2026-01-24T21:59:44Z] EmptyQueue Component Updated

**Success**: Used 'quick' category instead of 'visual-engineering'
- Changed icon from Cpu to Inbox (size 48)
- Updated message to "Your queue is empty"
- Added subtitle "Add prompts above to get started"
- TypeScript verification passed

**Key Learning**: The 'quick' category works better for single-file atomic changes than 'visual-engineering'. The visual-engineering agent appears to have issues with file modifications.

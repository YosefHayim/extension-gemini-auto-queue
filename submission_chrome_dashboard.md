# Chrome Web Store Submission - Version 2.0

## Basic Information

### Extension Name
```
Gemini Nano Flow
```

### Short Description (132 characters max)
```
Bulk image & video generation for Google Gemini. Queue prompts, attach reference images, automate your creative workflow.
```

### Detailed Description (Copy this entire block)
```
Gemini Nano Flow is a powerful productivity extension that supercharges your Google Gemini experience with batch processing, queue management, and workflow automation.

KEY FEATURES:

BATCH QUEUE PROCESSING
- Add multiple prompts and process them automatically
- Smart prompt parsing - each paragraph becomes a queue item
- Real-time progress tracking with processing time display
- Fast/Thinking/Pro model selection per prompt

MULTI-TOOL SUPPORT
- Image Generation
- Video Generation  
- Canvas Mode
- Deep Research
- Learning Mode
- Visual Layout

BULK ACTIONS
- Attach multiple reference images to all pending prompts at once
- AI-powered bulk prompt optimization
- Bulk text modification (prepend/append)
- Reset prompts by status, text, images, tool, or mode
- Copy all prompts to clipboard

REFERENCE IMAGES
- Attach multiple images per prompt as creative references
- Support for local files and cloud URLs
- Drag-and-drop image upload
- Bulk attach to entire queue

CSV IMPORT
- Bulk import prompts from CSV files
- Map local images to CSV references
- Support for multiple images per prompt (separated by | or ;)

TEMPLATE LIBRARY
- Organize prompts into folders
- Save and reuse favorite prompts with images
- AI-powered prompt optimization (optional, requires API key)

PROMPT ENHANCEMENT
- Global prefix/suffix for all prompts
- "NOT" clauses to exclude unwanted elements
- Text weighting with emphasis controls (1.2x, 1.5x, echo)

USER EXPERIENCE
- Interactive onboarding tour
- Resizable sidebar (280-600px)
- Left or right sidebar positioning
- Light/Dark theme support
- Real-time queue status
- Drag-and-drop queue reordering

ADVANCED SETTINGS
- Drip-feed mode with random delays
- Auto-stop on error option
- Model selection (Fast/Thinking/Pro)
- Export queue to TXT, JSON, or CSV

PRIVACY FOCUSED
- All data stored locally in your browser (IndexedDB + Chrome Storage)
- No external data collection
- API keys stored securely
- Queue data persists even with large image attachments

Works on: gemini.google.com and aistudio.google.com
```

---

## Category
```
Productivity
```

## Language
```
English
```

---

## Version Information

### Version Number
```
2.0.0
```

### What's New in This Version (Changelog)
```
Version 2.0 - Major Update

ARCHITECTURE OVERHAUL
- Complete modular redesign for improved reliability
- Separated automation into dedicated modules
- Better state management across all operations
- Migrated queue storage from Chrome Storage to IndexedDB for unlimited capacity

NEW BULK ACTIONS SYSTEM
- Attach multiple files to all pending prompts at once
- AI-powered bulk prompt optimization
- Bulk text modification (prepend/append to prompts)
- Advanced reset filters: by status, text, images, tool, or mode
- Copy all prompts to clipboard for backup

IMPROVED MODEL SELECTION
- Fast/Thinking/Pro mode selection now works reliably
- Fixed model switching detection
- Per-prompt model assignment

FASTER QUEUE PROCESSING
- Reduced wait times between prompts (was ~200s, now ~3s)
- Improved generation completion detection
- Better network monitoring for reliable automation

ENHANCED FILE ATTACHMENT
- Fixed bulk file attachment (multiple files now work correctly)
- Redesigned upload mechanism with fallback methods
- Support for drag-and-drop, paste, and file input

DEVELOPER IMPROVEMENTS
- Comprehensive logging system for debugging
- Action timing and performance tracking

BUG FIXES
- Fixed file attachment not working in some scenarios
- Fixed mode selection edge cases
- Fixed bulk attachment only keeping 1 file
- Fixed storage quota exceeded error when attaching many images
- Improved error handling throughout

STORAGE IMPROVEMENTS
- Queue data now stored in IndexedDB (no size limits)
- Automatic migration from previous Chrome Storage
- Settings and preferences remain in Chrome Storage for sync

PERFORMANCE
- Optimized content script initialization
- Reduced memory footprint
- Significantly faster queue processing
```

---

## Store Listing Assets

### Icon Requirements
- 128x128 PNG (store icon) - `icons/icon-128.png`

### Screenshots (Recommended: 5 screenshots, 1280x800 or 640x400)

**Screenshot 1 - Main Interface**
- Show the sidebar open on gemini.google.com
- Queue panel visible with a few items
- Caption: "Intuitive sidebar interface for managing your generation queue"

**Screenshot 2 - Queue Processing**
- Show active queue processing with progress
- Multiple items in different states
- Caption: "Batch process multiple prompts automatically"

**Screenshot 3 - Bulk Actions**
- Show the bulk actions dialog with options
- Attach files, AI optimize, modify, reset visible
- Caption: "Powerful bulk actions for managing large queues"

**Screenshot 4 - Reference Images**
- Show prompts with attached reference images
- Image thumbnails visible
- Caption: "Attach reference images to guide your generations"

**Screenshot 5 - Template Library**
- Show the templates panel with folders
- Some saved templates visible
- Caption: "Save and organize your favorite prompts"

### Promotional Images (Optional)
- Small tile: 440x280
- Large tile: 920x680
- Marquee: 1400x560

---

## Privacy Tab

### Single Purpose Description
```
This extension adds batch processing and queue management capabilities to Google Gemini, allowing users to process multiple prompts automatically with attached reference images.
```

### Permission Justifications

**Storage**
```
Required to save user preferences, prompt templates, and API keys locally in the browser. All data remains on the user's device.
```

**Unlimited Storage**
```
Required to store large queue data with attached reference images in IndexedDB without size limitations. Users can attach multiple high-resolution images to hundreds of prompts.
```

**Side Panel**
```
Required to display the extension's main user interface as a sidebar panel alongside Gemini.
```

**Active Tab**
```
Required to detect when the user is on gemini.google.com or aistudio.google.com to activate the extension's features.
```

**Tabs**
```
Required to manage extension activation across browser tabs and open the side panel on supported pages.
```

**Scripting**
```
Required to inject content scripts that enable automation features on Gemini and AI Studio websites.
```

**Host Permissions (gemini.google.com, aistudio.google.com)**
```
Required to run content scripts that automate prompt submission, tool selection, and generation detection on these specific Google AI websites.
```

### Data Usage Disclosure

**Are you collecting personal data?**
```
No
```

**Data Usage Explanation**
```
Gemini Nano Flow does not collect, store, or transmit any personal data to external servers. All user data is stored locally in the browser: queue data with images uses IndexedDB for unlimited capacity, while settings and templates use Chrome's Storage API. No data ever leaves the user's device. The extension only communicates with Google Gemini and AI Studio websites through browser automation, using the user's own session - no external API calls are made.
```

---

## Privacy Policy URL
```
https://github.com/[YOUR-USERNAME]/extension-gemini-auto-queue/blob/main/PRIVACY_POLICY.md
```

## Support URL (Optional)
```
https://github.com/[YOUR-USERNAME]/extension-gemini-auto-queue/issues
```

## Homepage URL (Optional)
```
https://github.com/[YOUR-USERNAME]/extension-gemini-auto-queue
```

---

## Distribution

### Visibility
```
Public
```

### Countries
```
All regions
```

### Mature Content
```
No
```

---

## Review Notes for Chrome Team (Optional)
```
Testing Instructions:
1. Navigate to gemini.google.com and sign in
2. The Nano Flow sidebar will appear automatically on the right side
3. Enter a prompt in the text area and click "Add to Queue"
4. Select a tool (Image, Video, Canvas, etc.) and mode (Fast/Thinking/Pro)
5. Click the Start button to begin processing
6. The extension automates clicking the appropriate tool and submitting prompts

Note: This extension automates the Gemini web interface - it does not make direct API calls. Users need an active Gemini account to use this extension.
```

---

## Checklist Before Submission

- [ ] Update version to 2.0.0 in `package.json`
- [ ] Update version to 2.0.0 in `wxt.config.ts`
- [ ] Run `pnpm run build` to create production build
- [ ] Run `pnpm run zip` to create distribution ZIP
- [ ] Test the ZIP by loading unpacked in Chrome
- [ ] Verify all features work on gemini.google.com
- [ ] Update PRIVACY_POLICY.md with current date and contact info
- [ ] Upload 5 screenshots (1280x800 recommended)
- [ ] Upload 128x128 icon
- [ ] Update GitHub repository links in URLs above

---

## Files to Upload

1. **Extension Package**: `.output/gemini-nano-flow-2.0.0-chrome.zip`
2. **Store Icon**: `public/icons/icon-128.png`
3. **Screenshots**: 5 images showing key features

---

## Marketing Description (For Extension Page)

### Headline Copy
```
Transform Your Gemini Workflow: Batch Process Hundreds of Prompts Automatically
```

### Marketing Description (Ready to Copy-Paste)
```
Stop submitting prompts one by one. Gemini Nano Flow lets you queue up hundreds of prompts and process them automatically while you focus on what matters.

WHY CREATORS LOVE NANO FLOW:

Batch Processing That Actually Works
Queue unlimited prompts, attach reference images, and let Nano Flow handle the rest. Each prompt is processed automatically with your chosen tool and model settings.

Bulk Actions = Time Saved
- Attach reference images to ALL pending prompts with one click
- Optimize entire queues with AI assistance
- Reset failed prompts by status, tool, or mode
- Export your work to TXT, JSON, or CSV

Professional Workflow Features
- Fast/Thinking/Pro model selection per prompt
- Drag-and-drop queue reordering
- Real-time progress tracking
- Template library for reusable prompts

Built for Power Users
Import hundreds of prompts from CSV files with image references. Use global prefix/suffix to maintain consistency. Apply text weighting for emphasis control.

Privacy First
Everything stays in your browser. No accounts, no data collection, no external servers. Your prompts, your images, your privacy. Unlimited local storage means you can queue hundreds of prompts with images without hitting limits.

PERFECT FOR:
- AI Artists generating image variations
- Content creators batch-producing visuals
- Researchers running multiple queries
- Anyone tired of manual prompt submission

Works seamlessly with gemini.google.com and aistudio.google.com.

Download now and reclaim your time.
```

### Short Marketing Bullets (For Ads/Banners)
```
- Queue unlimited prompts, process automatically
- Attach reference images in bulk (no storage limits!)
- Fast/Thinking/Pro model selection
- Export to TXT, JSON, CSV
- 100% private - all data stays local
```

### Social Media Copy (Twitter/X - 280 chars)
```
Tired of submitting Gemini prompts one by one? 

Nano Flow lets you queue hundreds of prompts, attach reference images in bulk, and process everything automatically.

Free Chrome extension. Your data stays local.

#GoogleGemini #AIArt #Productivity
```

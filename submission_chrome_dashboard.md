# Chrome Web Store Submission - Version 2.1.0

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
Gemini Nano Flow supercharges your Google Gemini experience with batch processing, queue management, and workflow automation.

KEY FEATURES:

BATCH QUEUE PROCESSING
- Add multiple prompts and process them automatically
- Smart prompt parsing - each paragraph becomes a queue item
- Real-time progress tracking with estimated time remaining
- Drag-and-drop queue reordering

MULTI-TOOL SUPPORT
- Image Generation
- Video Generation  
- Canvas Mode
- Deep Research
- Learning Mode

BULK ACTIONS
- Attach multiple reference images to all pending prompts
- AI-powered bulk prompt optimization (requires API key)
- Bulk text modification (prepend/append)
- Remove specific text or images from prompts
- Reset prompts by status
- Copy all prompts to clipboard
- Download all generated media from chat

REFERENCE IMAGES
- Attach multiple images per prompt as creative references
- Support for local files and cloud URLs
- Drag-and-drop image upload

CSV IMPORT
- Bulk import prompts from CSV files
- Map local images to CSV references
- Multiple images per prompt (separated by | or ;)

TEMPLATE LIBRARY
- Organize prompts into folders
- Save and reuse favorite prompts with images

PROMPT ENHANCEMENT
- Global prefix/suffix for all prompts
- Text weighting with emphasis controls

USER EXPERIENCE
- Interactive onboarding tour
- Resizable sidebar (280-600px)
- Left or right sidebar positioning
- Light/Dark theme support
- Real-time queue status

ADVANCED SETTINGS
- Drip-feed mode with random delays
- Auto-stop on error option
- Model selection (Fast/Thinking/Pro)
- Export queue to TXT, JSON, or CSV

PRIVACY FOCUSED
- All data stored locally in your browser
- No external data collection
- Queue data persists with IndexedDB (no size limits)

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
2.1.0
```

### What's New in This Version (Changelog)
```
Version 2.1.0 - Stability Update

CRITICAL FIX
- Fixed page crash when starting queue processing
- Removed invasive network interception that corrupted Gemini's streaming responses

STABILITY IMPROVEMENTS
- Switched to passive PerformanceObserver for network monitoring
- No longer patches window.fetch or XMLHttpRequest
- Generation detection now relies purely on DOM-based polling

PREVIOUS (2.0.0)
- Bulk download all generated media from chat
- IndexedDB storage for unlimited queue capacity
- AI-powered bulk prompt optimization
- Multi-tool support (Image, Video, Canvas, Research, Learning)
```

---

## Store Listing Assets

### Icon Requirements
- 128x128 PNG (store icon) - `icons/icon-128.png`

### Screenshots (1280x800 or 640x400)

**Screenshot 1 - Main Interface**
- Sidebar open on gemini.google.com with queue panel visible
- Caption: "Intuitive sidebar for managing your generation queue"

**Screenshot 2 - Queue Processing**
- Active queue with progress and estimated time
- Caption: "Batch process multiple prompts automatically"

**Screenshot 3 - Bulk Actions**
- Bulk actions dialog showing available options
- Caption: "Powerful bulk actions for large queues"

**Screenshot 4 - Reference Images**
- Prompts with attached reference image thumbnails
- Caption: "Attach reference images to guide generations"

**Screenshot 5 - Template Library**
- Templates panel with folders and saved prompts
- Caption: "Save and organize your favorite prompts"

---

## Privacy Tab

### Single Purpose Description
```
This extension adds batch processing and queue management to Google Gemini, allowing users to process multiple prompts automatically with attached reference images.
```

### Permission Justifications

**Storage**
```
Saves user preferences, prompt templates, and settings locally. All data remains on the user's device.
```

**Unlimited Storage**
```
Stores queue data with attached reference images in IndexedDB. Users can attach multiple high-resolution images to hundreds of prompts without size limitations.
```

**Side Panel**
```
Displays the main user interface as a sidebar panel alongside Gemini.
```

**Active Tab**
```
Detects when the user is on gemini.google.com or aistudio.google.com to activate extension features.
```

**Tabs**
```
Manages extension activation across browser tabs and opens the side panel on supported pages.
```

**Scripting**
```
Injects content scripts that enable automation features on Gemini and AI Studio websites.
```

**Host Permissions (gemini.google.com, aistudio.google.com)**
```
Runs content scripts that automate prompt submission, tool selection, and generation detection on these Google AI websites.
```

### Data Usage Disclosure

**Are you collecting personal data?**
```
No
```

**Data Usage Explanation**
```
Gemini Nano Flow does not collect or transmit any personal data. All data is stored locally: queue data in IndexedDB, settings in Chrome Storage. No external API calls are made except when using optional AI prompt optimization with your own API key. The extension only interacts with Google Gemini through browser automation using your existing session.
```

---

## Privacy Policy URL
```
https://github.com/YosefHayworx/extension-gemini-auto-queue/blob/main/PRIVACY_POLICY.md
```

## Support URL
```
https://github.com/YosefHayworx/extension-gemini-auto-queue/issues
```

## Homepage URL
```
https://github.com/YosefHayworx/extension-gemini-auto-queue
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

## Review Notes for Chrome Team
```
Testing Instructions:
1. Navigate to gemini.google.com and sign in with a Google account
2. The Nano Flow sidebar appears automatically on the right side
3. Enter a prompt in the text area and click "Add to Queue"
4. Select a tool (Image, Video, Canvas) from the dropdown
5. Click the Start button to begin processing
6. The extension automates clicking the appropriate tool and submitting prompts

Note: This extension automates the Gemini web interface through DOM manipulation. It does not make direct API calls to Google services. Users need an active Gemini account.
```

---

## Checklist Before Submission

- [ ] Version 2.1.0 in package.json
- [ ] Version 2.1.0 in wxt.config.ts
- [ ] Run `pnpm run build` for production build
- [ ] Run `pnpm run zip` for distribution ZIP
- [ ] Test ZIP by loading unpacked in Chrome
- [ ] Verify features work on gemini.google.com
- [ ] Update PRIVACY_POLICY.md
- [ ] Upload 5 screenshots (1280x800)
- [ ] Upload 128x128 icon
- [ ] Update GitHub repository links

---

## Files to Upload

1. **Extension Package**: `.output/gemini-nano-flow-2.1.0-chrome.zip`
2. **Store Icon**: `public/icons/icon-128.png`
3. **Screenshots**: 5 images showing key features

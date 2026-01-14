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

MULTI-TOOL SUPPORT
- Image Generation
- Video Generation  
- Canvas Mode
- Deep Research
- Learning Mode
- Visual Layout

REFERENCE IMAGES
- Attach multiple images per prompt as creative references
- Support for local files and cloud URLs
- Drag-and-drop image upload

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

ADVANCED SETTINGS
- Drip-feed mode with random delays
- Auto-stop on error option
- Model selection

PRIVACY FOCUSED
- All data stored locally in your browser
- No external data collection
- API keys stored securely

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
- Complete modular redesign for improved reliability and maintainability
- Separated automation into dedicated modules for each function
- Better state management across all operations

IMPROVED FILE ATTACHMENT
- Redesigned file upload mechanism with multiple fallback methods
- Enhanced event dispatching for better Gemini compatibility
- Support for drag-and-drop, paste, and file input approaches

ENHANCED AUTOMATION
- More reliable tool selection with retry logic
- Improved mode switching detection
- Better generation completion detection using network monitoring

DEVELOPER IMPROVEMENTS
- Comprehensive logging system for debugging
- Action timing and performance tracking
- Persistent log storage for troubleshooting

BUG FIXES
- Fixed file attachment not working in some scenarios
- Fixed mode selection edge cases
- Improved error handling throughout

PERFORMANCE
- Optimized content script initialization
- Reduced memory footprint
- Faster queue processing
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

**Screenshot 3 - Reference Images**
- Show prompts with attached reference images
- Image thumbnails visible
- Caption: "Attach reference images to guide your generations"

**Screenshot 4 - Template Library**
- Show the templates panel with folders
- Some saved templates visible
- Caption: "Save and organize your favorite prompts"

**Screenshot 5 - Settings & Customization**
- Show settings panel with options
- Theme toggle, position control visible
- Caption: "Customize your workflow with advanced settings"

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
Required to save user preferences, queue items, prompt templates, and API keys locally in the browser. All data remains on the user's device.
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
Gemini Nano Flow does not collect, store, or transmit any personal data to external servers. All user data (settings, queue, templates, API keys) is stored locally in the browser using Chrome's Storage API and never leaves the user's device. The extension only communicates with Google Gemini and AI Studio APIs using the user's own API credentials, with requests made directly from the browser to Google's services.
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
4. Click the Start button to begin processing
5. The extension automates clicking the appropriate tool and submitting prompts

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

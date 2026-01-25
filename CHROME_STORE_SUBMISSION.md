# Chrome Web Store Submission Guide

**Version:** 2.1.0  
**Last Updated:** January 25, 2026

This document contains all the text you need to copy-paste into the Chrome Web Store Developer Dashboard for successful submission.

---

## TABLE OF CONTENTS

1. [Store Listing](#1-store-listing)
2. [Privacy Tab](#2-privacy-tab)
3. [Permission Justifications](#3-permission-justifications)
4. [Data Disclosure](#4-data-disclosure)
5. [Review Notes](#5-review-notes)
6. [Submission Checklist](#6-submission-checklist)

---

## 1. STORE LISTING

### Extension Name
```
Gemini Nano Flow
```

### Short Description (132 characters max)
```
Bulk queue processing for Google Gemini. Batch prompts, attach reference images, automate your AI creative workflow.
```

### Detailed Description
```
Gemini Nano Flow supercharges your Google Gemini experience with powerful batch processing, queue management, and workflow automation tools.

🚀 KEY FEATURES

BATCH QUEUE PROCESSING
• Add multiple prompts and process them automatically one by one
• Smart prompt parsing - paste multiple paragraphs, each becomes a queue item
• Real-time progress tracking with estimated time remaining
• Drag-and-drop queue reordering for priority control

MULTI-TOOL SUPPORT
• Image Generation
• Video Generation  
• Canvas Mode
• Deep Research
• Learning Mode

REFERENCE IMAGES
• Attach multiple reference images to guide AI generations
• Support for local files and cloud image URLs
• Visual thumbnails in queue for easy management

BULK ACTIONS
• Add images to all pending prompts at once
• AI-powered bulk prompt optimization (requires your own API key)
• Bulk text modifications (prepend, append, find/replace)
• Clear prompts by status (pending, failed, completed)
• Copy all prompts to clipboard
• Download all generated media from Gemini chat

CSV IMPORT & EXPORT
• Import prompts from CSV with image mapping
• Export queue to TXT, JSON, or CSV formats

TEMPLATE LIBRARY
• Save favorite prompts for reuse
• Organize templates into folders
• Quick-add templates to queue

SMART SCHEDULING
• Schedule queue processing for later
• Drip-feed mode with random delays between prompts
• Auto-pause on errors option

USER EXPERIENCE
• Clean sidebar interface alongside Gemini
• Light and Dark theme support
• Resizable sidebar (280-600px width)
• Interactive onboarding for new users

PRIVACY FOCUSED
• All your data stored locally in your browser
• Optional anonymous analytics (can be disabled)
• No account required, no sign-up
• Open source on GitHub

Works exclusively on: gemini.google.com and aistudio.google.com

Note: This extension automates the Gemini web interface. You need an active Google account with Gemini access.
```

### Category
```
Productivity
```

### Language
```
English
```

---

## 2. PRIVACY TAB

### Single Purpose Description
```
This extension provides batch queue processing and automation tools for Google Gemini, allowing users to process multiple AI prompts sequentially with attached reference images.
```

### Privacy Policy URL
```
https://github.com/YosefHayworx/extension-gemini-auto-queue/blob/main/PRIVACY_POLICY.md
```

---

## 3. PERMISSION JUSTIFICATIONS

Copy each justification into the corresponding field in the Chrome Web Store dashboard.

### storage
```
Required to save user preferences (theme, settings), prompt templates, and application state locally in the browser. All data remains on the user's device and is never transmitted externally.
```

### sidePanel
```
Required to display the extension's main user interface as a sidebar panel alongside the Gemini website. The sidebar contains the queue management controls, settings, and prompt input area.
```

### activeTab
```
Required to detect when the user navigates to gemini.google.com or aistudio.google.com so the extension can activate its features. The extension only reads the URL to check if it should activate - it does not access page content through this permission.
```

### tabs
```
Required to manage extension state across browser tabs, detect tab navigation events, and open the sidebar panel when the user visits supported Gemini pages. Used to find existing Gemini tabs when processing the queue.
```

### scripting
```
Required to inject content scripts into gemini.google.com and aistudio.google.com pages. These scripts enable the automation features: selecting AI tools, inputting prompts, uploading images, and detecting when generations complete. Scripts only run on the specified Google AI domains.
```

### alarms
```
Required to enable scheduled queue processing. Users can schedule their queue to start processing at a specific time. The alarm triggers the background service worker to begin processing when the scheduled time arrives.
```

### identity
```
Used for optional Google Sign-In functionality that allows users to sync their settings across devices. This is entirely optional - the extension works fully without sign-in. Users must explicitly click "Sign In" to use this feature.
```

### Host Permission: *://gemini.google.com/*
```
Required to run content scripts that automate the Gemini interface. Scripts handle: selecting the appropriate AI tool (Image, Video, Canvas, etc.), entering prompts into the input field, uploading reference images, clicking the submit button, and detecting when AI generation completes. The extension ONLY accesses gemini.google.com - no other websites.
```

### Host Permission: *://aistudio.google.com/*
```
Required to run content scripts on Google AI Studio, providing the same automation features as on the main Gemini site. Users can use the extension on either platform. The extension ONLY accesses aistudio.google.com - no other websites.
```

---

## 4. DATA DISCLOSURE

### Does your extension collect user data?
```
Yes
```

### Data Type: Web History
```
No - We do not collect browsing history
```

### Data Type: Location
```
No - We do not collect location data
```

### Data Type: Personal Communications
```
No - We do not collect personal communications
```

### Data Type: User Activity
```
Yes - We collect anonymous feature usage analytics
```

**Justification for User Activity:**
```
We collect anonymous analytics about which features are used (e.g., "user clicked bulk action", "user processed 5 queue items") to understand which features are valuable and identify bugs. This data is:
- Completely anonymous (no user identification)
- Aggregated (not tied to individuals)
- Optional (users can disable in settings)
- Respects Do Not Track browser setting

We use PostHog for analytics. Data collected includes: feature usage counts, error categories (not content), extension version. We do NOT collect: prompts, images, API keys, or any personal information.
```

### Data Type: Website Content
```
No - We do not collect or transmit website content
```

### Data Type: Personally Identifiable Information
```
No - We do not collect names, email addresses, or PII
```

### Data Type: Authentication Information
```
No - User API keys are stored locally only and never transmitted to our servers
```

### Data Type: Health Information
```
No
```

### Data Type: Financial Information
```
No
```

### Are you selling user data?
```
No
```

### Are you using or transferring user data for purposes unrelated to the extension?
```
No
```

### Are you using or transferring user data for creditworthiness or lending purposes?
```
No
```

---

## 5. REVIEW NOTES

Copy this into the "Review Notes" field for the Chrome review team:

```
TESTING INSTRUCTIONS

Prerequisites:
- Google account with access to Google Gemini (gemini.google.com)
- No API key required for basic functionality

Setup:
1. Install the extension
2. Navigate to gemini.google.com
3. Sign in to your Google account if not already signed in
4. The Nano Flow sidebar will appear on the right side of the page

Basic Testing Flow:
1. In the sidebar, type a prompt like "A cute cat wearing a hat" in the text area
2. Click "Add to Queue" button - the prompt appears in the queue list
3. Select "Image" from the tool dropdown (default)
4. Click the green "Start" button to begin processing
5. Watch as the extension:
   - Clicks the Image tool in Gemini's interface
   - Enters your prompt in Gemini's input field
   - Clicks the send button
   - Waits for generation to complete
   - Marks the item as "Completed" in the queue

Additional Features to Test:
- Add multiple prompts (paste paragraphs separated by blank lines)
- Drag and drop to reorder queue items
- Attach reference images using the image button
- Try different tools: Video, Canvas, Deep Research
- Toggle dark/light theme in settings

IMPORTANT NOTES FOR REVIEWERS

1. AUTOMATION: This extension automates the Gemini web interface through DOM manipulation. It clicks buttons, enters text, and detects completion - all visible user actions.

2. NO HIDDEN API CALLS: The extension does not make hidden API calls to Google. All interactions go through the normal Gemini web interface using the user's logged-in session.

3. OPTIONAL FEATURES: AI prompt optimization requires users to provide their own API keys (Gemini, OpenAI, or Anthropic). These keys are stored locally and used for direct API calls from the browser.

4. ANALYTICS: We collect anonymous usage analytics through PostHog to improve the extension. Users can disable this in Settings → Interface → Analytics toggle. We respect Do Not Track.

5. ERROR TRACKING: We use Sentry for anonymous crash reporting to fix bugs quickly. No personal data or prompts are collected.

6. HOST PERMISSIONS: We only request access to gemini.google.com and aistudio.google.com - the only sites where our automation features work.

7. OPEN SOURCE: Full source code is available at:
https://github.com/YosefHayworx/extension-gemini-auto-queue

Contact for questions: yosefisabag@gmail.com
```

---

## 6. SUBMISSION CHECKLIST

Before submitting, verify all items:

### Code & Build
- [ ] Version number matches in `package.json` and `wxt.config.ts` (2.1.0)
- [ ] Run `pnpm build` - builds without errors
- [ ] Run `pnpm zip` - creates distribution ZIP
- [ ] Test the ZIP by loading unpacked in Chrome
- [ ] Verify all features work on gemini.google.com

### Store Listing
- [ ] Extension name: "Gemini Nano Flow"
- [ ] Short description (under 132 characters)
- [ ] Detailed description copied correctly
- [ ] Category set to "Productivity"
- [ ] Language set to "English"

### Privacy
- [ ] Privacy Policy URL is accessible and up-to-date
- [ ] Single purpose description filled in
- [ ] All permission justifications completed
- [ ] Data disclosure form completed accurately

### Assets
- [ ] 128x128 icon uploaded (PNG)
- [ ] At least 1 screenshot (1280x800 recommended)
- [ ] Screenshots show actual extension functionality

### URLs
- [ ] Privacy Policy: https://github.com/YosefHayworx/extension-gemini-auto-queue/blob/main/PRIVACY_POLICY.md
- [ ] Support URL: https://github.com/YosefHayworx/extension-gemini-auto-queue/issues
- [ ] Homepage: https://github.com/YosefHayworx/extension-gemini-auto-queue

### Distribution
- [ ] Visibility: Public
- [ ] Regions: All regions
- [ ] Mature content: No

---

## SCREENSHOT SUGGESTIONS

Prepare 3-5 screenshots (1280x800 or 640x400) showing:

1. **Main Interface** - Sidebar open on gemini.google.com with queue visible
   - Caption: "Intuitive sidebar for managing your prompt queue"

2. **Queue Processing** - Active queue with items in different states
   - Caption: "Process multiple prompts automatically"

3. **Bulk Actions** - Bulk actions dialog open
   - Caption: "Powerful bulk actions for large queues"

4. **Reference Images** - Queue items with image thumbnails
   - Caption: "Attach reference images to guide AI generations"

5. **Settings/Templates** - Settings panel or template library
   - Caption: "Customize your workflow with templates and settings"

---

## FILES TO UPLOAD

1. **Extension Package:** `.output/gemini-nano-flow-2.1.0-chrome.zip`
2. **Store Icon:** 128x128 PNG icon
3. **Screenshots:** 3-5 images showing key features

---

## COMMON REJECTION REASONS & HOW TO AVOID

| Rejection Reason | How We Address It |
|-----------------|-------------------|
| Missing permission justification | All 7 permissions + 2 host permissions have detailed justifications above |
| Excessive permissions | Each permission is used and necessary for core functionality |
| Missing privacy policy | Comprehensive privacy policy hosted on GitHub |
| Data collection not disclosed | Full disclosure of PostHog analytics and Sentry error tracking |
| Vague single purpose | Clear single purpose: "batch queue processing for Google Gemini" |
| Extension doesn't work | Detailed testing instructions provided for reviewers |

---

**Good luck with your submission!**

# Chrome Web Store Submission Guide

This document contains all necessary information for submitting PromptQueue to the Chrome Web Store.

## Extension Details

### Basic Information

| Field | Value |
|-------|-------|
| **Name** | PromptQueue - Gemini Queue & Automation |
| **Version** | 2.2.0 |
| **Category** | Productivity |
| **Language** | English |

### Short Description (132 characters max)
```
Queue prompts, bulk generate images/videos, auto-download & automate Gemini. 14-day FREE trial, Pro lifetime $1!
```

### Detailed Description (16,000 characters max)
```
PromptQueue supercharges your Google Gemini experience with powerful queue management and automation features.

KEY FEATURES:

🚀 Queue Management
• Queue unlimited prompts at once
• Pause, edit, and reorder items anytime
• Drag-and-drop queue organization
• Smart retry on errors with configurable attempts
• Real-time status tracking (Pending, Processing, Completed, Failed)

🎨 Multi-Tool Support
• Image generation with Gemini 2.0 Flash & Imagen 3
• Video creation with Veo 3.1
• Canvas mode for collaborative writing
• Deep Research for analysis tasks
• Learning mode for guided education
• Visual Layout for dashboard creation

🎬 Generation Modes
• Default - Use Gemini's current mode
• Quick/Fast - Fastest responses for simple tasks
• Thinking/Deep - Complex problem-solving with reasoning
• Pro - Advanced math/code with extended thinking

📥 Bulk Operations
• Attach files to multiple prompts at once
• AI-powered prompt optimization (Gemini, ChatGPT, Claude)
• Bulk translate prompts to multiple languages
• Find & replace text across entire queue
• Clone prompts with variations
• Download all generated media from chat

🌐 Translation & Optimization
• Bulk translate prompts to 10+ languages
• AI-powered prompt enhancement
• Support for multiple AI providers (Gemini, OpenAI, Anthropic)
• Global prefix/suffix modifiers
• Negative prompt management

⚙️ Automation Features
• Drip-feed mode with configurable delays (1-120 seconds)
• Auto-stop on error detection
• Scheduled queue processing (specific time or daily)
• Smart auto-retry with exponential backoff
• Error categorization (rate limit, network, content policy)

📁 Template System
• Save prompts as reusable templates
• Folder-based organization with custom colors/icons
• Usage tracking for templates
• Quick-access template library
• 12 icon options + 6 color choices

🎁 Start with 14-Day FREE Trial
• No credit card required
• Full access to all features
• Generate unlimited images & videos
• All 7 tools unlocked (Image, Video, Canvas, etc.)

💎 Then Go Pro Lifetime - Only $1!
• Unlimited generations forever
• Priority support
• One-time payment, lifetime access
• No subscriptions, no recurring fees

SUPPORTED PLATFORMS:
• Google Gemini (gemini.google.com)
• Google AI Studio (aistudio.google.com)

PRIVACY:
• Your prompts stay local in browser storage
• Google OAuth for secure authentication only
• No tracking of your prompts or generated content
• Analytics can be disabled in settings
• Error tracking via Sentry (opt-out available)

TECHNICAL HIGHLIGHTS:
• Built with React, TypeScript, and Tailwind CSS
• Manifest V3 compliant
• IndexedDB for efficient data storage
• Real-time network monitoring for generation detection
• Multi-language UI support (English + Hebrew)

Perfect for creators, designers, marketers, developers, and anyone who wants to maximize their Gemini AI productivity!
```

---

## Permissions Justification

### Required Permissions

| Permission | Justification |
|------------|---------------|
| **storage** | Store queue items, templates, folders, user settings, and authentication state locally in the browser. All prompt data remains on the user's device. Uses IndexedDB for large datasets with Chrome storage fallback. |
| **sidePanel** | Display the main extension interface as a side panel on Gemini pages. The sidepanel contains the queue, templates, and settings panels for managing automation workflows. |
| **activeTab** | Interact with the current Gemini tab to submit prompts, detect generation results, and download media. Only activates when user opens the extension. |
| **tabs** | Open and manage the side panel on Gemini tabs, coordinate between background service worker and content scripts, and track tab state for multi-tab workflows. |
| **scripting** | Inject content scripts to interact with Gemini's interface for tool selection, mode switching, prompt submission, file upload, and result detection. |
| **alarms** | Enable scheduled queue processing (process at specific time or daily) and drip-feed timing delays between prompts to avoid rate limiting. |
| **identity** | Authenticate users via Google OAuth for account features, subscription management, and cross-device sync. Uses chrome.identity.launchWebAuthFlow for secure OAuth flow. |

### Host Permissions

| Host | Justification |
|------|---------------|
| `*://gemini.google.com/*` | Required to interact with Google Gemini's web interface for automated prompt submission, tool/mode selection, file uploads, and generation result detection. The content script monitors DOM changes and network requests to detect when generation completes. |

### OAuth Scopes

| Scope | Justification |
|-------|---------------|
| `email` | Identify user account for subscription features and daily usage tracking. |
| `profile` | Display user name and avatar in the extension header and settings. |
| `openid` | Standard OpenID Connect authentication for secure identity verification. |

---

## Privacy Policy Requirements

### Data Collection Summary

| Data Type | Collected | Purpose | Storage Location |
|-----------|-----------|---------|------------------|
| Email | Yes | Account identification, subscription management | Server (encrypted) |
| Name | Yes | Display in UI | Server (encrypted) |
| Profile Photo | Yes | Display in UI | Not stored (fetched from Google) |
| Prompts | No | - | Local browser only (IndexedDB) |
| Generated Images/Videos | No | - | Local browser only |
| Queue Items | No | - | Local browser only (IndexedDB) |
| Templates & Folders | No | - | Local browser only |
| Settings | No | - | Local browser only |
| API Keys | No | - | Local browser only (encrypted) |
| Usage Analytics | Optional | Product improvement, error tracking | PostHog (anonymized), Sentry (errors) |

### Privacy Policy URL
```
https://yosefhayimsabag.com/prompt-queue/privacy
```

### Terms of Service URL
```
https://yosefhayimsabag.com/prompt-queue/terms
```

---

## Store Listing Assets

### Screenshots Required (1280x800 or 640x400)

1. **Main Queue Interface** - Show the side panel with queued prompts in various states (pending, processing, completed)
2. **Tool Selection** - Show the tool dropdown with all 7 supported tools (Image, Video, Canvas, Deep Research, etc.)
3. **Bulk Operations** - Show the bulk actions dialog with options like AI Optimize, Translate, Attach Files
4. **Template Management** - Show folder organization with colored folders and template cards
5. **Settings Panel** - Show configuration options including drip-feed, API keys, and theme settings

### Promotional Images

| Size | Purpose |
|------|---------|
| 440x280 | Small promotional tile |
| 920x680 | Large promotional tile (optional) |
| 1400x560 | Marquee promotional tile (optional) |

### Icon Sizes Included
- 16x16 (toolbar)
- 32x32 (toolbar @2x)
- 48x48 (extensions page)
- 128x128 (Chrome Web Store, installation dialog)

---

## Review Notes for Google

```
Testing Instructions:

1. Install the extension
2. Navigate to gemini.google.com
3. Click the extension icon to open the side panel
4. Sign in with Google (optional - required for subscription features)
5. Add prompts to the queue using the input field at the bottom
6. Select a tool (Image, Video, etc.) from the dropdown
7. Click "Start" to begin processing the queue
8. Observe automatic prompt submission and result detection

Key Features to Test:
- Queue management: Add, edit, delete, reorder prompts
- Tool switching: Select different tools (Image, Video, Canvas, etc.)
- Mode switching: Change between Quick, Thinking, and Pro modes
- Bulk operations: Use "Bulk Actions" menu for batch operations
- Templates: Save prompts as templates and organize in folders
- Drip-feed: Enable in settings to add delays between prompts
- Auto-retry: Failed prompts automatically retry with backoff

Notes:
- Extension requires an active Gemini session
- Some tools (Video, Canvas) require Gemini Advanced subscription
- The extension automates the Gemini web interface, it does not use private APIs
- All automation is initiated by user action (clicking Start)
- Content scripts only run on gemini.google.com domain

Test Account:
[Provide test account if needed for review]
```

---

## Compliance Checklist

- [ ] Privacy policy is published and accessible
- [ ] Terms of service is published and accessible
- [ ] All permissions are justified and minimal
- [ ] No use of remote code execution
- [ ] No collection of unnecessary user data
- [ ] Analytics are opt-out capable
- [ ] OAuth scopes are minimal and justified
- [ ] Extension follows Manifest V3 requirements
- [ ] No deceptive behavior or misleading claims
- [ ] Proper branding (not impersonating Google)
- [ ] Content scripts limited to necessary domains
- [ ] No persistent background processes (service worker based)

---

## Version History

### v2.2.0 (Current)
- Complete rebranding from Gqmini to PromptQueue
- Added subscription plan support (Free/Pro Lifetime)
- Pro user crown badge on avatar
- Updated checkout integration with Lemon Squeezy
- Improved user profile display
- Added 128x128 logo variant

### v2.1.0
- Added bulk translation functionality (10+ languages)
- Implemented model selection dialog (Flash/Imagen 3)
- Added delete by pattern feature
- Project renamed from Groove to Gqmini
- Added Shuffle Options dialog for variations

### v2.0.0
- Complete UI redesign with React + Tailwind CSS
- Added Google OAuth authentication
- Template and folder management system
- Drag-and-drop queue organization (@dnd-kit)
- Multi-provider AI support (Gemini, OpenAI, Anthropic)
- IndexedDB storage for large queues
- Sentry error tracking integration
- PostHog analytics (opt-out available)

### v1.x
- Initial release with basic queue functionality
- Image generation support
- Simple prompt management

---

## Support Information

| Resource | URL |
|----------|-----|
| Support Email | support@yosefhayimsabag.com |
| Documentation | https://yosefhayimsabag.com/prompt-queue/docs |
| Bug Reports | https://github.com/yosefhayim/extension-gemini-auto-queue/issues |
| Website | https://yosefhayimsabag.com/prompt-queue |

---

## Monetization

| Plan | Price | Features |
|------|-------|----------|
| Free Trial | $0 | 14-day full access, no credit card required, all features |
| Pro Lifetime | $1 | Unlimited generations, priority support, lifetime access |

### Promotional Offer
🎉 **14-Day Free Trial** - Full access to everything, no credit card required!
💰 **Lifetime Access for $1** - Unlimited generations forever. One payment, no subscriptions.

Payment processing: Lemon Squeezy (secure checkout)
Checkout URL: https://yosefhayimsabag.com/prompt-queue/checkout/buy/44bdfe85-5961-4caf-911b-9d5a059664ce

---

## Technical Stack

| Component | Technology |
|-----------|------------|
| Framework | WXT (Web Extension Tools) |
| UI Library | React 18 |
| Styling | Tailwind CSS |
| State Management | React Query (@tanstack/react-query) |
| Drag & Drop | @dnd-kit |
| Type Safety | TypeScript |
| Build Tool | Vite |
| Testing | Vitest + Testing Library |
| Error Tracking | Sentry |
| Analytics | PostHog |
| Payments | Lemon Squeezy |
| Icons | Lucide React |

---

## API Integrations (User-Provided Keys)

Users can optionally provide their own API keys for prompt optimization:

| Provider | Purpose |
|----------|---------|
| Google Gemini | Prompt enhancement via Gemini API |
| OpenAI | Prompt optimization via ChatGPT |
| Anthropic | Prompt improvement via Claude |

Note: These are optional features. The extension works fully without external API keys.

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
Queue unlimited prompts, bulk generate images, auto-download, translate & automate your Gemini AI workflow.
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

🎨 Bulk Image Generation
• Generate multiple images in batch
• Auto-download all generated images
• Support for Gemini 2.0 Flash and Imagen 3
• Visual layout and canvas mode support

🌐 Translation & Optimization
• Bulk translate prompts instantly
• AI-powered prompt optimization
• Support for multiple AI providers (Gemini, OpenAI, Anthropic)

⚙️ Automation Features
• Drip-feed mode with configurable delays
• Auto-stop on error detection
• Scheduled queue processing
• Template system for reusable prompts

📁 Organization
• Folder-based template management
• CSV import/export support
• Search and filter capabilities
• Custom folder colors and icons

💎 Premium Features (Pro Plan)
• Unlimited prompts
• Priority support
• Advanced features

SUPPORTED PLATFORMS:
• Google Gemini (gemini.google.com)
• Google AI Studio (aistudio.google.com)

PRIVACY:
• Your data stays local in browser storage
• Google OAuth for secure authentication only
• No tracking of your prompts or generated content
• Analytics can be disabled in settings

Perfect for creators, designers, marketers, and anyone who wants to maximize their Gemini AI productivity!
```

---

## Permissions Justification

### Required Permissions

| Permission | Justification |
|------------|---------------|
| **storage** | Store user settings, queue items, templates, and folders locally in the browser. All data remains on the user's device. |
| **sidePanel** | Display the main extension interface as a side panel on Gemini pages, allowing users to manage their queue while using Gemini. |
| **activeTab** | Interact with the current Gemini tab to submit prompts and detect generation results. Only activates when user clicks the extension. |
| **tabs** | Open the side panel on Gemini tabs and coordinate between extension components. Required for multi-tab workflow. |
| **scripting** | Inject content scripts to interact with Gemini's interface for prompt submission and result detection. |
| **alarms** | Enable scheduled queue processing and drip-feed timing between prompts. |
| **identity** | Authenticate users via Google OAuth for account features and subscription management. |

### Host Permissions

| Host | Justification |
|------|---------------|
| `*://gemini.google.com/*` | Required to interact with Google Gemini's interface for prompt automation and result detection. |

### OAuth Scopes

| Scope | Justification |
|-------|---------------|
| `email` | Identify user account for subscription features. |
| `profile` | Display user name and avatar in the extension. |
| `openid` | Standard OpenID Connect authentication. |

---

## Privacy Policy Requirements

### Data Collection Summary

| Data Type | Collected | Purpose | Storage Location |
|-----------|-----------|---------|------------------|
| Email | Yes | Account identification | Server (encrypted) |
| Name | Yes | Display in UI | Server (encrypted) |
| Profile Photo | Yes | Display in UI | Not stored (fetched) |
| Prompts | No | - | Local browser only |
| Generated Images | No | - | Local browser only |
| Queue Items | No | - | Local browser only |
| Settings | No | - | Local browser only |
| Usage Analytics | Optional | Product improvement | PostHog (anonymized) |

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

1. **Main Queue Interface** - Show the side panel with queued prompts
2. **Bulk Generation** - Show multiple images being generated
3. **Template Management** - Show folder organization and templates
4. **Settings Panel** - Show configuration options
5. **Translation Feature** - Show bulk translation dialog

### Promotional Images

| Size | Purpose |
|------|---------|
| 440x280 | Small promotional tile |
| 920x680 | Large promotional tile (optional) |
| 1400x560 | Marquee promotional tile (optional) |

### Icon Sizes Included
- 16x16
- 32x32
- 48x48
- 128x128

---

## Review Notes for Google

```
Testing Instructions:

1. Install the extension
2. Navigate to gemini.google.com
3. Click the extension icon to open the side panel
4. Sign in with Google (required for full functionality)
5. Add prompts to the queue using the input field
6. Click "Start" to begin processing the queue
7. Observe automatic prompt submission and result detection

Notes:
- Extension requires an active Gemini session
- Some features require Gemini Advanced subscription
- The extension automates the Gemini web interface, it does not use private APIs
- All automation is initiated by user action (clicking Start)

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

---

## Version History

### v2.2.0 (Current)
- Added subscription plan support (Free/Pro)
- Pro user crown badge on avatar
- Updated checkout integration
- Improved user profile display

### v2.1.0
- Added bulk translation functionality
- Implemented model selection dialog
- Added delete by pattern feature
- Project renamed from Groove to PromptQueue

### v2.0.0
- Complete UI redesign
- Added Google OAuth authentication
- Template and folder management
- Drag-and-drop queue organization
- Multi-provider AI support

---

## Support Information

| Resource | URL |
|----------|-----|
| Support Email | support@yosefhayimsabag.com/prompt-queue |
| Documentation | https://yosefhayimsabag.com/prompt-queue/docs |
| Bug Reports | https://github.com/yosefhayim/extension-gemini-auto-queue/issues |
| Website | https://yosefhayimsabag.com/prompt-queue |

---

## Monetization

| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | Limited daily prompts, basic features |
| Pro Lifetime | 1$ | Unlimited prompts, all features, lifetime access |

Payment processing: Handled via secure checkout at yosefhayimsabag.com/prompt-queue

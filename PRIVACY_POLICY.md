# Privacy Policy for Gemini Nano Flow

**Last Updated:** January 25, 2026  
**Version:** 2.1.0

## Introduction

Gemini Nano Flow ("the Extension", "we", "our") is a Chrome browser extension that provides batch processing and queue management for Google Gemini. This Privacy Policy explains what data we collect, how we use it, and your rights regarding your data.

## Summary

- We collect **anonymous usage analytics** to improve the extension (can be disabled)
- We collect **anonymous error reports** to fix bugs (can be disabled)
- All your personal data (prompts, images, API keys) stays **on your device**
- We do **not** sell or share your data with third parties
- You have **full control** over your data and analytics preferences

## Data We Collect

### 1. Local Data (Stored on Your Device Only)

The following data is stored **locally in your browser** and never transmitted to our servers:

| Data Type | Purpose | Storage |
|-----------|---------|---------|
| Queue Items | Your prompts and generation history | IndexedDB |
| Reference Images | Images you attach to prompts | IndexedDB |
| API Keys | Your Gemini/OpenAI/Anthropic keys | Chrome Storage (encrypted) |
| Settings | Theme, preferences, tool settings | Chrome Storage |
| Prompt Templates | Your saved templates and folders | Chrome Storage |

**This data never leaves your device** unless you explicitly export it.

### 2. Anonymous Analytics (Optional - Can Be Disabled)

When analytics is enabled, we collect **anonymous usage data** through PostHog:

**What we collect:**
- Feature usage (which tools and actions you use)
- Error categories (not error content)
- Extension version
- Aggregate statistics (queue sizes, processing times)

**What we DO NOT collect:**
- Your prompts or generated content
- Your images or files
- Your API keys
- Your Google account information
- Personally identifiable information
- Browsing history outside Gemini

**Privacy protections:**
- Anonymous ID (not linked to your identity)
- Respects browser "Do Not Track" setting
- No session recording
- No autocapture of interactions

**How to disable:** Settings → Interface → Toggle "Analytics" off

### 3. Anonymous Error Reporting (Optional - Can Be Disabled)

When error reporting is enabled, we collect **anonymous crash reports** through Sentry:

**What we collect:**
- Error type and stack trace
- Extension context (which feature crashed)
- Browser and extension version

**What we DO NOT collect:**
- Your prompts or content
- Your images or files
- Your API keys
- Personal information

**How to disable:** Settings → Interface → Toggle "Analytics" off (disables both analytics and error reporting)

## Third-Party Services

### Services We Use

| Service | Purpose | Data Sent | Privacy Policy |
|---------|---------|-----------|----------------|
| PostHog | Anonymous analytics | Usage events | [posthog.com/privacy](https://posthog.com/privacy) |
| Sentry | Error reporting | Error logs | [sentry.io/privacy](https://sentry.io/privacy) |

### Services You Connect (Using Your API Keys)

| Service | When Used | Data Sent |
|---------|-----------|-----------|
| Google Gemini API | AI prompt optimization | Your prompts (direct from browser) |
| OpenAI API | AI prompt optimization | Your prompts (direct from browser) |
| Anthropic API | AI prompt optimization | Your prompts (direct from browser) |

**Note:** API calls are made **directly from your browser** to these services. We do not proxy, intercept, or store your API requests or responses.

## Chrome Extension Permissions

### Required Permissions

| Permission | Why We Need It |
|------------|----------------|
| `storage` | Save your settings, templates, and preferences locally |
| `sidePanel` | Display the extension interface as a sidebar |
| `activeTab` | Detect when you're on gemini.google.com to activate features |
| `tabs` | Manage extension activation across browser tabs |
| `scripting` | Inject automation scripts into Gemini pages |
| `alarms` | Enable scheduled queue processing |
| `identity` | Optional Google Sign-In for syncing (if enabled) |

### Host Permissions

| Domain | Why We Need It |
|--------|----------------|
| `gemini.google.com` | Run automation scripts on Gemini |
| `aistudio.google.com` | Run automation scripts on AI Studio |

**We only access these specific domains.** We cannot access any other websites.

## Data Security

- API keys are stored using Chrome's secure encrypted storage
- All local data uses browser-native storage APIs
- No data is transmitted except:
  - Anonymous analytics (if enabled)
  - Anonymous error reports (if enabled)
  - Your API calls to AI services (using your keys)

## Your Rights and Choices

### Control Your Data

| Action | How To |
|--------|--------|
| View your data | Settings → Export queue to JSON |
| Delete all data | Uninstall the extension |
| Clear queue | Settings → Clear Queue |
| Disable analytics | Settings → Interface → Analytics toggle |
| Export templates | Templates → Export |

### Opt-Out Options

1. **Disable Analytics:** Settings → Interface → Turn off "Analytics"
2. **Use Do Not Track:** Enable DNT in your browser (we respect it)
3. **Clear Data:** Uninstall the extension to remove all local data

## Data Retention

| Data Type | Retention |
|-----------|-----------|
| Local data | Until you delete it or uninstall |
| Anonymous analytics | 90 days (PostHog) |
| Error reports | 90 days (Sentry) |

## Children's Privacy

This extension is not intended for children under 13. We do not knowingly collect information from children under 13. If you believe a child has provided us data, please contact us.

## International Users

Our analytics services (PostHog, Sentry) are hosted in the United States. By using the extension with analytics enabled, you consent to the transfer of anonymous data to the US. No personal data is transferred.

## Changes to This Policy

We may update this Privacy Policy when we release new features. We will:
- Update the "Last Updated" date
- Note significant changes in the extension's changelog
- Prompt re-consent for any new data collection

## Compliance

This extension complies with:
- Chrome Web Store Developer Program Policies
- General Data Protection Regulation (GDPR)
- California Consumer Privacy Act (CCPA)
- California Online Privacy Protection Act (CalOPPA)

## Contact Us

For privacy questions or data requests:

- **Email:** yosefisabag@gmail.com
- **GitHub:** [github.com/YosefHayworx/extension-gemini-auto-queue](https://github.com/YosefHayworx/extension-gemini-auto-queue)
- **Issues:** [GitHub Issues](https://github.com/YosefHayworx/extension-gemini-auto-queue/issues)

## Open Source

This extension is open source. You can review our code to verify our privacy practices:
[GitHub Repository](https://github.com/YosefHayworx/extension-gemini-auto-queue)

# Privacy Policy for Gemini Nano Flow

**Last Updated:** [Date - Update this when you publish]

## Introduction

Gemini Nano Flow ("we", "our", or "the extension") is committed to protecting your privacy. This Privacy Policy explains how we handle data in our Chrome extension.

## Data Collection

**We do not collect, store, or transmit any personal data to external servers.** All data is stored locally in your browser using Chrome's Storage API.

## Data Storage

The extension stores the following data locally in your browser:

- **API Keys**: Your Gemini, OpenAI, or Anthropic API keys (encrypted in browser storage)
- **Queue Items**: Your generation queue and history
- **User Preferences**: Settings such as theme, default model, and tool preferences
- **Prompt Templates**: Your saved prompt templates and folders
- **Onboarding Status**: Whether you've completed the initial setup

**This data never leaves your device** and is not accessible to the extension developer or any third parties.

## Permissions Explained

The extension requires the following permissions:

### Storage Permission
- **Purpose**: To save your settings, queue, and templates locally
- **Data**: All data remains on your device
- **Access**: Only the extension can access this data

### Side Panel Permission
- **Purpose**: To display the extension's user interface
- **Data**: No data is collected through this permission

### Active Tab and Tabs Permissions
- **Purpose**: To detect when you're on gemini.google.com or aistudio.google.com and manage tabs
- **Data**: We only check the URL to determine if the extension should activate
- **Access**: We do not read or store tab content

### Host Permissions (gemini.google.com and aistudio.google.com)
- **Purpose**: To inject content scripts that enable automation features on these specific websites
- **Data**: The extension only works on these domains and does not access any other websites
- **Access**: Content scripts run only on the specified domains

## Third-Party Services

The extension communicates directly with:

- **Google Gemini API**: Using your API key to generate images
- **OpenAI API** (optional): If you configure an OpenAI API key
- **Anthropic API** (optional): If you configure an Anthropic API key

**We do not intercept, store, or have access to your API requests or responses.** All API calls are made directly from your browser to the respective service providers.

## Data Security

- All API keys are stored using Chrome's secure storage API
- No data is transmitted to external servers except for the API calls you explicitly make
- All data is stored locally in your browser's storage

## Data Deletion

You can delete all extension data at any time by:

1. Uninstalling the extension (this removes all stored data)
2. Using Chrome's "Clear browsing data" feature for extension data
3. Resetting the extension in Chrome's extension settings

## Children's Privacy

Our extension is not intended for children under 13. We do not knowingly collect any information from children under 13.

## Changes to This Privacy Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last Updated" date at the top of this policy.

## Contact Us

If you have any questions about this Privacy Policy, please contact us at:

- **Email**: [Your Email Address]
- **GitHub**: [Your GitHub Repository URL]

## Compliance

This extension complies with:
- Chrome Web Store Developer Program Policies
- General Data Protection Regulation (GDPR) principles
- California Consumer Privacy Act (CCPA) requirements

---

**Note**: This privacy policy is a template. Please update the contact information and date before publishing.

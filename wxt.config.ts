import { defineConfig } from "wxt";

// OAuth Client ID - use environment variable or fallback to default
// For dev: Create a Chrome Extension OAuth client in Google Cloud Console
// and register your unpacked extension ID with it
// For prod: Use the published extension's OAuth client ID
const GOOGLE_OAUTH_CLIENT_ID =
  process.env.GOOGLE_OAUTH_CLIENT_ID ||
  "93413528149-h4ib3sng7loe4acd8ueaif6p501rn820.apps.googleusercontent.com";

export default defineConfig({
  srcDir: "src",
  entrypointsDir: "extension/entrypoints",
  publicDir: "extension/public",
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Groove",
    description: "A bulk image generation and automation tool for Gemini",
    version: "2.1.0",
    permissions: ["storage", "sidePanel", "activeTab", "tabs", "scripting", "alarms", "identity"],
    host_permissions: ["*://gemini.google.com/*"],
    oauth2: {
      client_id: GOOGLE_OAUTH_CLIENT_ID,
      scopes: ["email", "profile", "openid"],
    },
    side_panel: {
      default_path: "sidepanel.html",
    },
    action: {
      default_title: "Groove",
      default_popup: "popup.html",
      default_icon: {
        "16": "icons/icon-16.png",
        "32": "icons/icon-32.png",
        "48": "icons/icon-48.png",
        "128": "icons/icon-128.png",
      },
    },
    icons: {
      "16": "icons/icon-16.png",
      "32": "icons/icon-32.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png",
    },
  },
  runner: {
    startUrls: ["https://gemini.google.com/"],
  },
});

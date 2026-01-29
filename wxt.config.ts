import { defineConfig } from "wxt";

const GOOGLE_OAUTH_CLIENT_ID =
  "93413528149-jv645o9j92id2n40k84t6v3i8150erc7.apps.googleusercontent.com";

export default defineConfig({
  srcDir: "src",
  entrypointsDir: "extension/entrypoints",
  publicDir: "extension/public",
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "PromptQueue - Gemini Queue & Automation",
    description:
      "Queue unlimited prompts, bulk generate images, auto-download results, translate prompts, and automate your Gemini AI workflow with smart retry and batch processing.",
    version: "2.2.0",
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
      default_title: "PromptQueue - Gemini Queue & Automation",
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

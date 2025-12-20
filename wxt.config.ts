import { defineConfig } from "wxt";

export default defineConfig({
  srcDir: "src",
  modules: ["@wxt-dev/module-react"],
  imports: {
    // Exclude barrel files to prevent duplicate export warnings
    dirsScanOptions: {
      filePatterns: ["*.ts", "*.tsx", "!index.ts", "!index.tsx"],
    },
  },
  manifest: {
    name: "Gemini Nano Flow",
    description: "A bulk image generation and automation tool for Gemini and AI Studio",
    version: "1.0.0",
    permissions: ["storage", "sidePanel", "activeTab", "tabs"],
    host_permissions: ["https://gemini.google.com/*", "https://aistudio.google.com/*", "https://generativelanguage.googleapis.com/*"],
    side_panel: {
      default_path: "sidepanel.html",
    },
    action: {
      default_title: "Gemini Nano Flow",
      default_icon: {
        "16": "icons/icon-16.svg",
        "32": "icons/icon-32.svg",
        "48": "icons/icon-48.svg",
        "128": "icons/icon-128.svg",
      },
    },
    icons: {
      "16": "icons/icon-16.svg",
      "32": "icons/icon-32.svg",
      "48": "icons/icon-48.svg",
      "128": "icons/icon-128.svg",
    },
  },
  runner: {
    startUrls: ["https://gemini.google.com/"],
  },
});

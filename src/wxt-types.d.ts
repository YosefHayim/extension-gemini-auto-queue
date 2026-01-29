// WXT type references without the broken auto-imports
/// <reference types="wxt/vite-builder-env" />
/// <reference types="@wxt-dev/module-react" />

import type { defineBackground as DefineBackground, defineContentScript as DefineContentScript } from "wxt/sandbox";

declare global {
  const defineBackground: typeof DefineBackground;
  const defineContentScript: typeof DefineContentScript;
}

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_POSTHOG_API_KEY?: string;
  readonly VITE_POSTHOG_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

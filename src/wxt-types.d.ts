// WXT type references without the broken auto-imports
/// <reference types="wxt/vite-builder-env" />
/// <reference types="@wxt-dev/module-react" />

import type { defineBackground as DefineBackground, defineContentScript as DefineContentScript } from "wxt/sandbox";

declare global {
  const defineBackground: typeof DefineBackground;
  const defineContentScript: typeof DefineContentScript;
}

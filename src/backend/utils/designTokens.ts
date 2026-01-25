/**
 * Design Tokens - Centralized color and styling system
 * Used across all components for consistent theming
 */

export const DESIGN_TOKENS = {
  // Primary colors
  primary: {
    light: "blue-500",
    dark: "blue-400",
    accent: "blue-600",
  },

  // Neutral colors - Light theme
  neutral: {
    light: {
      bg: "white",
      bgSecondary: "slate-50",
      border: "slate-200",
      borderSubtle: "slate-100",
      text: "slate-900",
      textSecondary: "slate-700",
      textTertiary: "slate-500",
      textQuaternary: "slate-400",
      hover: "slate-100",
      hoverSecondary: "slate-200",
    },
    // Neutral colors - Dark theme
    dark: {
      bg: "slate-900",
      bgSecondary: "slate-950",
      border: "white/10",
      borderSubtle: "white/5",
      text: "white",
      textSecondary: "white/80",
      textTertiary: "white/50",
      textQuaternary: "white/40",
      hover: "white/10",
      hoverSecondary: "white/[0.04]",
    },
  },

  // Status colors
  status: {
    success: "emerald-500",
    warning: "amber-500",
    error: "red-500",
    info: "blue-500",
  },

  // Dialog specific tokens
  dialog: {
    light: {
      backdrop: "black/80",
      border: "slate-200",
      borderSubtle: "white/5",
      bg: "white",
      bgGradient: "from-white to-slate-50",
      divider: "white/5",
    },
    dark: {
      backdrop: "black/80",
      border: "white/10",
      borderSubtle: "white/5",
      bg: "slate-900",
      bgGradient: "from-slate-900 to-slate-950",
      divider: "white/5",
    },
  },

  // Button states
  button: {
    light: {
      disabled: "bg-slate-100 text-slate-300 cursor-not-allowed",
      enabled:
        "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-blue-400 hover:shadow-blue-500/40 active:scale-[0.98]",
    },
    dark: {
      disabled: "bg-white/5 text-white/30 cursor-not-allowed",
      enabled:
        "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-blue-400 hover:shadow-blue-500/40 active:scale-[0.98]",
    },
  },

  // Selection/highlight colors
  selection: {
    light: {
      border: "blue-500/50",
      bg: "blue-50",
      shadow: "shadow-blue-500/10",
    },
    dark: {
      border: "blue-500/50",
      bg: "blue-500/10",
      shadow: "shadow-blue-500/10",
    },
  },

  // Icon background colors
  icon: {
    light: {
      bg: "slate-100",
      bgHover: "slate-200",
      text: "slate-500",
      textHover: "slate-600",
      bgSelected: "blue-500",
      textSelected: "white",
    },
    dark: {
      bg: "white/5",
      bgHover: "white/10",
      text: "white/60",
      textHover: "white/80",
      bgSelected: "blue-500",
      textSelected: "white",
    },
  },

  // Badge/tag colors
  badge: {
    light: {
      bg: "slate-100",
      text: "slate-400",
      bgSelected: "blue-500/20",
      textSelected: "blue-400",
    },
    dark: {
      bg: "white/5",
      text: "white/40",
      bgSelected: "blue-500/20",
      textSelected: "blue-400",
    },
  },
} as const;

/**
 * Helper function to get theme-aware token value
 * @param tokenPath - Path to token (e.g., "neutral.text")
 * @param isDark - Whether dark theme is active
 * @returns The appropriate token value
 */
type TokenValue = string | Record<string, unknown>;

export function getToken(tokenPath: string, isDark: boolean): string {
  const parts = tokenPath.split(".");
  let current: TokenValue = DESIGN_TOKENS as unknown as TokenValue;

  for (const part of parts) {
    if (typeof current !== "object") {
      return "";
    }
    const obj = current as Record<string, TokenValue>;
    const nextValue =
      part === "light" || part === "dark" ? obj[isDark ? "dark" : "light"] : obj[part];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- runtime safety for dynamic path traversal
    if (nextValue === undefined) {
      return "";
    }
    current = nextValue;
  }

  return typeof current === "string" ? current : "";
}

/**
 * Get neutral color tokens based on theme
 */
export function getNeutralTokens(isDark: boolean) {
  return DESIGN_TOKENS.neutral[isDark ? "dark" : "light"];
}

/**
 * Get dialog tokens based on theme
 */
export function getDialogTokens(isDark: boolean) {
  return DESIGN_TOKENS.dialog[isDark ? "dark" : "light"];
}

/**
 * Get button tokens based on theme
 */
export function getButtonTokens(isDark: boolean) {
  return DESIGN_TOKENS.button[isDark ? "dark" : "light"];
}

/**
 * Get selection tokens based on theme
 */
export function getSelectionTokens(isDark: boolean) {
  return DESIGN_TOKENS.selection[isDark ? "dark" : "light"];
}

/**
 * Get icon tokens based on theme
 */
export function getIconTokens(isDark: boolean) {
  return DESIGN_TOKENS.icon[isDark ? "dark" : "light"];
}

/**
 * Get badge tokens based on theme
 */
export function getBadgeTokens(isDark: boolean) {
  return DESIGN_TOKENS.badge[isDark ? "dark" : "light"];
}

/**
 * Export Dialog specific token helpers
 */
export const ExportDialogTokens = {
  getDialogContainerClass: (isDark: boolean) =>
    isDark
      ? "border-white/10 bg-gradient-to-b from-slate-900 to-slate-950"
      : "border-slate-200 bg-gradient-to-b from-white to-slate-50",

  getHeaderDividerClass: () => "border-white/5",

  getFooterDividerClass: () => "border-white/5",

  getExportButtonClass: (isDark: boolean, isDisabled: boolean) => {
    if (isDisabled) {
      return isDark
        ? "cursor-not-allowed bg-white/5 text-white/30"
        : "cursor-not-allowed bg-slate-100 text-slate-300";
    }
    return "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-blue-400 hover:shadow-blue-500/40 active:scale-[0.98]";
  },
} as const;

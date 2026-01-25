// Design tokens from .pen file
export const DESIGN = {
  colors: {
    foreground: "#0D0D0D",
    mutedForeground: "#71717A",
    muted: "#F4F4F5",
    border: "#E4E4E7",
    background: "#FFFFFF",
    card: "#FFFFFF",
    // AI Tools special colors
    aiBlue: "#DBEAFE",
    aiBlueText: "#3B82F6",
    aiPurple: "#F3E8FF",
    aiGreen: "#D1FAE5",
    // Danger Zone
    dangerRed: "#DC2626",
    dangerBg: "#FEF2F2",
    dangerIconBg: "#FEE2E2",
  },
  spacing: {
    actionPadding: "py-2 px-2.5", // [8, 10]
    iconTextGap: "gap-2.5", // 10px
    sectionGap: "gap-1.5", // 6px
    actionGap: "gap-0.5", // 2px
    contentPadding: "p-3", // 12px
    contentGap: "gap-4", // 16px between sections
    headerPadding: "p-4", // 16px
  },
  typography: {
    dialogTitle: "text-base font-semibold", // 16px, 600
    dialogSubtitle: "text-[13px] font-normal", // 13px, normal
    sectionHeader: "text-[11px] font-semibold uppercase tracking-wide", // 11px, 600
    actionLabel: "text-[13px] font-medium", // 13px, 500
  },
  sizes: {
    iconContainer: "h-7 w-7", // 28x28
    icon: 14, // 14x14
    chevron: 14, // 14x14
    closeIcon: 16, // 16x16
  },
  radius: {
    sm: "rounded", // 4px
    md: "rounded-md", // 6px
    lg: "rounded-lg", // 8px
  },
} as const;

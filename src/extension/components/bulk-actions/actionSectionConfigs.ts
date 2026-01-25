import {
  ArrowUpToLine,
  BookmarkPlus,
  ClipboardCopy,
  Copy,
  Cpu,
  FileSpreadsheet,
  ImageMinus,
  ImagePlus,
  Languages,
  MinusCircle,
  Palette,
  RefreshCw,
  Replace,
  RotateCcw,
  Shuffle,
  Sparkles,
  TextCursorInput,
  Trash2,
  Wand2,
} from "lucide-react";

import { DESIGN } from "./bulkActionsDesign";

import type { ActionSection } from "./actionTypes";

export const getActionSections = (): ActionSection[] => [
  {
    title: "Queue Management",
    actions: [
      { id: "shuffle", icon: Shuffle, label: "Shuffle Order" },
      { id: "moveTop", icon: ArrowUpToLine, label: "Move to Top" },
      { id: "retryFailed", icon: RotateCcw, label: "Retry Failed" },
      { id: "reset", icon: RefreshCw, label: "Reset Status" },
    ],
  },
  {
    title: "Prompt Editing",
    actions: [
      { id: "prefix", icon: TextCursorInput, label: "Add Prefix/Suffix", hasChevron: true },
      { id: "findReplace", icon: Replace, label: "Find & Replace", hasChevron: true },
      { id: "negative", icon: MinusCircle, label: "Add Negative Prompts", hasChevron: true },
      { id: "stylePreset", icon: Palette, label: "Apply Style Preset", hasChevron: true },
    ],
  },
  {
    title: "AI Tools",
    actions: [
      {
        id: "ai",
        icon: Sparkles,
        label: "AI Optimize",
        iconBg: DESIGN.colors.aiBlue,
        badge: { text: "Pro", bg: DESIGN.colors.aiBlue, color: DESIGN.colors.aiBlueText },
      },
      {
        id: "variations",
        icon: Copy,
        label: "Clone with Variations",
        iconBg: DESIGN.colors.aiPurple,
        hasChevron: true,
      },
      {
        id: "translate",
        icon: Languages,
        label: "Translate Prompts",
        iconBg: DESIGN.colors.aiGreen,
        hasChevron: true,
      },
    ],
  },
  {
    title: "Media",
    actions: [
      { id: "attachImages", icon: ImagePlus, label: "Attach Images to All", hasChevron: true },
      { id: "removeImages", icon: ImageMinus, label: "Remove All Images" },
      { id: "changeTool", icon: Wand2, label: "Change Tool", hasChevron: true },
      {
        id: "changeModel",
        icon: Cpu,
        label: "Change Model",
        iconBg: DESIGN.colors.aiPurple,
        hasChevron: true,
      },
    ],
  },
  {
    title: "Export",
    actions: [
      { id: "exportCsv", icon: FileSpreadsheet, label: "Export to CSV", hasChevron: true },
      { id: "copyClipboard", icon: ClipboardCopy, label: "Copy to Clipboard" },
      { id: "saveTemplates", icon: BookmarkPlus, label: "Save as Templates", hasChevron: true },
    ],
  },
  {
    title: "Danger Zone",
    titleColor: DESIGN.colors.dangerRed,
    isDanger: true,
    actions: [{ id: "delete", icon: Trash2, label: "Delete Selected" }],
  },
];

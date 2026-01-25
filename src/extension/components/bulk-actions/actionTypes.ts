import type { BulkActionType } from "./types";

export type ActionItemId =
  | BulkActionType
  | "shuffle"
  | "moveTop"
  | "retryFailed"
  | "prefix"
  | "findReplace"
  | "negative"
  | "stylePreset"
  | "variations"
  | "translate"
  | "attachImages"
  | "removeImages"
  | "changeTool"
  | "changeModel"
  | "exportCsv"
  | "copyClipboard"
  | "saveTemplates"
  | "delete";

export interface ActionItem {
  id: ActionItemId;
  icon: React.ElementType;
  label: string;
  hasChevron?: boolean;
  iconBg?: string;
  iconColor?: string;
  badge?: { text: string; bg: string; color: string };
}

export interface ActionSection {
  title: string;
  titleColor?: string;
  actions: ActionItem[];
  isDanger?: boolean;
}

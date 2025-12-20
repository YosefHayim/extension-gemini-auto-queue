export enum QueueStatus {
  IDLE = "IDLE",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  PAUSED = "PAUSED",
}

export interface ModelResult {
  url: string;
  modelName: string;
  timestamp: number;
}

export interface QueueItem {
  id: string;
  originalPrompt: string;
  finalPrompt: string;
  status: QueueStatus;
  startTime?: number;
  endTime?: number;
  images?: string[];
  results?: {
    flash?: ModelResult;
    pro?: ModelResult;
  };
  error?: string;
}

export enum SidebarPosition {
  LEFT = "LEFT",
  RIGHT = "RIGHT",
}

export enum GeminiModel {
  FLASH = "gemini-2.0-flash-preview-image-generation",
  PRO = "imagen-3.0-generate-002",
}

export interface PromptTemplate {
  id: string;
  name: string;
  text: string;
  createdAt: number;
  lastEditedAt: number;
  timesUsed: number;
  images?: string[];
}

export interface Folder {
  id: string;
  name: string;
  templates: PromptTemplate[];
  isOpen: boolean;
}

export enum ThemeMode {
  LIGHT = "LIGHT",
  DARK = "DARK",
}

export interface AppSettings {
  prefix: string;
  suffix: string;
  position: SidebarPosition;
  primaryModel: GeminiModel;
  dripFeed: boolean;
  autoCaption: boolean;
  globalNegatives: string;
  theme: ThemeMode;
  apiKey?: string;
}

// Chrome Extension Message Types
export enum MessageType {
  GET_QUEUE = "GET_QUEUE",
  UPDATE_QUEUE = "UPDATE_QUEUE",
  GET_SETTINGS = "GET_SETTINGS",
  UPDATE_SETTINGS = "UPDATE_SETTINGS",
  GET_FOLDERS = "GET_FOLDERS",
  UPDATE_FOLDERS = "UPDATE_FOLDERS",
  PROCESS_QUEUE = "PROCESS_QUEUE",
  STOP_PROCESSING = "STOP_PROCESSING",
  GENERATE_IMAGE = "GENERATE_IMAGE",
  OPEN_SIDE_PANEL = "OPEN_SIDE_PANEL",
}

export interface ExtensionMessage<T = unknown> {
  type: MessageType;
  payload?: T;
}

export interface ExtensionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Storage Keys
export const STORAGE_KEYS = {
  QUEUE: "nano_flow_queue",
  SETTINGS: "nano_flow_settings",
  FOLDERS: "nano_flow_folders",
  ONBOARDING_COMPLETE: "nano_flow_onboarding_complete",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

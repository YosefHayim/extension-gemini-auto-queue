import {
  Camera,
  GraduationCap,
  LayoutGrid,
  type LucideIcon,
  MessageCircle,
  PenTool,
  Search,
  Video,
} from "lucide-react";

// User-friendly queue status names for better UX
export enum QueueStatus {
  Pending = "Pending",
  Processing = "Processing",
  Completed = "Completed",
  Failed = "Failed",
}

export enum ContentType {
  TextOnly = "textOnly",
  WithImages = "withImages",
  TextAndImages = "textAndImages",
}

// Gemini speed/quality modes - affects generation time and quality
export enum GeminiMode {
  Quick = "quick", // Fast generation (Gemini 3: "Fast")
  Deep = "deep", // Deep thinking (Gemini 3: "Thinking")
  Pro = "pro", // Highest quality (Gemini 3: "Pro")
}

// Mode display info for UI
export const GEMINI_MODE_INFO: Record<
  GeminiMode,
  {
    label: string;
    labelHebrew: string;
    description: string;
    dataTestId: string;
    color: string;
  }
> = {
  [GeminiMode.Quick]: {
    label: "Fast",
    labelHebrew: "מהיר",
    description: "Answers quickly, best for simple tasks",
    dataTestId: "bard-mode-option-fast",
    color: "emerald",
  },
  [GeminiMode.Deep]: {
    label: "Thinking",
    labelHebrew: "חשיבה",
    description: "Solves complex problems with deeper reasoning",
    dataTestId: "bard-mode-option-thinking",
    color: "blue",
  },
  [GeminiMode.Pro]: {
    label: "Pro",
    labelHebrew: "Pro",
    description: "Advanced math & code, thinks longer",
    dataTestId: "bard-mode-option-pro",
    color: "purple",
  },
};

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
  tool?: GeminiTool;
  mode?: GeminiMode;
  startTime?: number;
  endTime?: number;
  completionTimeSeconds?: number;
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

// Available Gemini tools that can be selected
export enum GeminiTool {
  NONE = "none", // No specific tool - regular chat
  IMAGE = "image", // Image creation
  VIDEO = "video", // Video creation (Veo 3.1)
  CANVAS = "canvas", // Canvas mode
  DEEP_RESEARCH = "deep_research", // Deep Research
  LEARNING = "learning", // Personalized Learning
  VISUAL_LAYOUT = "visual_layout", // Visual Layout (Labs)
}

// Tool display info for UI
export const GEMINI_TOOL_INFO: Record<
  GeminiTool,
  { label: string; icon: LucideIcon; description: string }
> = {
  [GeminiTool.NONE]: {
    label: "Chat Only",
    icon: MessageCircle,
    description: "Regular conversation without tools",
  },
  [GeminiTool.IMAGE]: { label: "Image", icon: Camera, description: "Generate images with Imagen" },
  [GeminiTool.VIDEO]: { label: "Video", icon: Video, description: "Create videos with Veo 3.1" },
  [GeminiTool.CANVAS]: {
    label: "Canvas",
    icon: PenTool,
    description: "Collaborative writing canvas",
  },
  [GeminiTool.DEEP_RESEARCH]: {
    label: "Research",
    icon: Search,
    description: "Deep research mode",
  },
  [GeminiTool.LEARNING]: {
    label: "Learning",
    icon: GraduationCap,
    description: "Personalized learning",
  },
  [GeminiTool.VISUAL_LAYOUT]: {
    label: "Layout",
    icon: LayoutGrid,
    description: "Visual layout (Labs)",
  },
};

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
  SYSTEM = "SYSTEM",
}

// AI Providers for prompt optimization
export enum AIProvider {
  GEMINI = "gemini",
  OPENAI = "openai",
  ANTHROPIC = "anthropic",
}

// AI Provider display info for UI
export const AI_PROVIDER_INFO: Record<AIProvider, { label: string; description: string }> = {
  [AIProvider.GEMINI]: { label: "Google Gemini", description: "Google's Gemini AI models" },
  [AIProvider.OPENAI]: { label: "OpenAI", description: "GPT models from OpenAI" },
  [AIProvider.ANTHROPIC]: {
    label: "Anthropic Claude",
    description: "Claude models from Anthropic",
  },
};

// Type for storing API keys per provider
export interface AIApiKeys {
  gemini?: string;
  openai?: string;
  anthropic?: string;
}

export interface AppSettings {
  prefix: string;
  suffix: string;
  position: SidebarPosition;
  primaryModel: GeminiModel;
  dripFeed: boolean;
  autoCaption: boolean;
  globalNegatives: string;
  globalNegativesEnabled: boolean;
  theme: ThemeMode;
  /** @deprecated Use aiApiKeys.gemini instead */
  apiKey?: string;
  // Tool settings
  defaultTool: GeminiTool; // Default tool for new prompts
  toolSequence: GeminiTool[]; // Sequence pattern for cycling tools (e.g., [IMAGE, VIDEO, CANVAS])
  useToolSequence: boolean; // Whether to use the sequence pattern
  // AI Provider settings for prompt optimization
  aiApiKeys: AIApiKeys; // API keys for each supported AI provider
  preferredAIProvider: AIProvider; // Which AI provider to use for prompt optimization
  // Sidebar settings
  sidebarWidth: number; // Width of sidebar in pixels (min: 280, max: 600)
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
  PAUSE_PROCESSING = "PAUSE_PROCESSING",
  STOP_PROCESSING = "STOP_PROCESSING",
  GENERATE_IMAGE = "GENERATE_IMAGE",
  OPEN_SIDE_PANEL = "OPEN_SIDE_PANEL",
  // Web automation messages
  PASTE_PROMPT = "PASTE_PROMPT",
  ENABLE_IMAGE_CREATION = "ENABLE_IMAGE_CREATION",
  SUBMIT_PROMPT = "SUBMIT_PROMPT",
  PROMPT_SUBMITTED = "PROMPT_SUBMITTED",
  GENERATION_COMPLETE = "GENERATION_COMPLETE",
  CONTENT_SCRIPT_READY = "CONTENT_SCRIPT_READY",
  TOGGLE_SIDEBAR = "TOGGLE_SIDEBAR",
  GET_EXTENSION_ENABLED = "GET_EXTENSION_ENABLED",
  SET_EXTENSION_ENABLED = "SET_EXTENSION_ENABLED",
  PING = "PING",
  // Media download messages
  DOWNLOAD_CHAT_MEDIA = "DOWNLOAD_CHAT_MEDIA",
  SCAN_CHAT_MEDIA = "SCAN_CHAT_MEDIA",
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
  EXTENSION_ENABLED: "nano_flow_extension_enabled",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

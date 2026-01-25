import { GeminiTool } from "@/backend/types";

export const SELECTORS = {
  textInput: '.ql-editor[contenteditable="true"]',
  textInputAlt: 'rich-textarea .ql-editor[contenteditable="true"]',
  textInputAlt2: 'div[role="textbox"][contenteditable="true"]',
  textInputAlt3: '.textarea[contenteditable="true"]',

  toolboxButton: 'button[aria-label="כלים"]',
  toolboxButtonAlt: "button.toolbox-drawer-button",
  toolboxButtonAlt2: ".toolbox-drawer-button-with-label",
  toolboxButtonAlt3: 'button[aria-label="Tools"]',

  submitButton: 'button[aria-label="שליחת הנחיה"]',
  submitButtonAlt: 'button[aria-label="Submit prompt"]',
  submitButtonAlt2: 'button[aria-label="Send message"]',
  submitButtonAlt3: 'button[data-test-id="send-button"]',
  submitButtonAlt4: ".send-button",

  uploadButton: 'button[aria-label="פתיחת תפריט העלאת קבצים"]',
  uploadButtonAlt: 'button[aria-label="Open upload file menu"]',
  uploadButtonAlt2: ".upload-button",
  uploadButtonAlt3: 'button[data-test-id="upload-button"]',

  fileInput: 'input[type="file"]',

  responseContainer: ".response-container",
  loadingIndicator: '.loading-indicator, [aria-busy="true"]',
  modelResponse: ".model-response-text",

  thinkingAvatar: ".bard-avatar.thinking",
  processingState: ".processing-state_container--processing",
  processingButton: ".processing-state_button--processing",

  spinnerAnimation: "lottie-animation",
  matSpinner: "mat-spinner",
  loadingDots: ".loading-dots",
  streamingIndicator: ".streaming-indicator",
  typingIndicator: ".typing-indicator",
} as const;

export type SelectorKey = keyof typeof SELECTORS;

export const TOOL_SELECTORS: Record<
  GeminiTool,
  {
    jfExtHebrew: string;
    jfExtEnglish: string;
    textPatterns: string[];
    fontIcons: string[];
  }
> = {
  [GeminiTool.NONE]: {
    jfExtHebrew: "",
    jfExtEnglish: "",
    textPatterns: [],
    fontIcons: [],
  },
  [GeminiTool.IMAGE]: {
    jfExtHebrew: "יצירת תמונות",
    jfExtEnglish: "Image creation",
    textPatterns: ["יצירת תמונות", "Image creation", "Create image", "Generate image", "Imagen"],
    fontIcons: ["image", "photo_camera", "add_photo_alternate"],
  },
  [GeminiTool.VIDEO]: {
    jfExtHebrew: "יצירת סרטונים",
    jfExtEnglish: "Video creation",
    textPatterns: ["יצירת סרטונים", "Video creation", "Veo", "Create video", "Create videos"],
    fontIcons: ["movie", "videocam", "video_camera_back"],
  },
  [GeminiTool.CANVAS]: {
    jfExtHebrew: "canvas",
    jfExtEnglish: "canvas",
    textPatterns: ["Canvas", "canvas", "Note stack", "note_stack"],
    fontIcons: ["note_stack_add", "note_stack", "edit_note"],
  },
  [GeminiTool.DEEP_RESEARCH]: {
    jfExtHebrew: "deep research",
    jfExtEnglish: "deep research",
    textPatterns: ["Deep Research", "deep research", "מחקר מעמיק"],
    fontIcons: ["travel_explore", "explore", "search"],
  },
  [GeminiTool.LEARNING]: {
    jfExtHebrew: "למידה מותאמת אישית",
    jfExtEnglish: "personalized learning",
    textPatterns: ["למידה מותאמת אישית", "Personalized learning", "Learning", "Guided Learning"],
    fontIcons: ["auto_stories", "school", "menu_book"],
  },
  [GeminiTool.VISUAL_LAYOUT]: {
    jfExtHebrew: "פריסה חזותית",
    jfExtEnglish: "visual layout",
    textPatterns: ["פריסה חזותית", "Visual layout", "Layout", "Dynamic view"],
    fontIcons: ["team_dashboard", "dashboard", "view_quilt", "drive_drawing"],
  },
};

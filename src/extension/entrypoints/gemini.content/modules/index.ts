export { initNetworkMonitor, isNetworkGenerating, waitForNetworkComplete } from "@/extension/entrypoints/gemini.content/modules/networkMonitor";
export { selectTool, resetToolState } from "@/extension/entrypoints/gemini.content/modules/toolSelection/index";
export { selectMode, resetModeState } from "@/extension/entrypoints/gemini.content/modules/modeSelection/index";
export { uploadImages, pastePromptToInput, submitPrompt } from "@/extension/entrypoints/gemini.content/modules/promptInput/index";
export {
  isVideoGenerating,
  isVideoGenerationComplete,
  isCanvasGenerating,
  isCanvasGenerationComplete,
  isGeminiThinking,
  waitForGenerationComplete,
} from "@/extension/entrypoints/gemini.content/modules/generationDetection";

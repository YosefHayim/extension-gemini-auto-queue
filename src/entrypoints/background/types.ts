/**
 * Background service worker types and constants
 */

export const SCHEDULE_ALARM_NAME = "nano_flow_schedule";

export const PERMITTED_HOSTS = ["gemini.google.com", "aistudio.google.com"];

export interface ProcessingState {
  isProcessing: boolean;
  isPaused: boolean;
  activeGeminiTabId: number | null;
}

export const DEFAULT_PROCESSING_STATE: ProcessingState = {
  isProcessing: false,
  isPaused: false,
  activeGeminiTabId: null,
};

/**
 * Check if a URL belongs to a permitted host
 */
export const isPermittedHost = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return PERMITTED_HOSTS.some(
      (host) => urlObj.hostname === host || urlObj.hostname.endsWith(`.${host}`)
    );
  } catch {
    return false;
  }
};

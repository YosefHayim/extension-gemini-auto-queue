import {
  AIProvider,
  type AIApiKeys,
  type AppSettings,
  type Folder,
  GeminiModel,
  GeminiTool,
  type QueueItem,
  SidebarPosition,
  STORAGE_KEYS,
  ThemeMode,
} from "@/backend/types";

import {
  getAllQueueItems,
  setAllQueueItems,
  updateQueueItemInDb,
  onQueueChange as onQueueChangeDb,
  migrateFromChromeStorage,
  requestPersistentStorage,
} from "@/backend/services/queueDb";

/**
 * Default application settings
 */
export const DEFAULT_SETTINGS: AppSettings = {
  prefix: "",
  suffix: "",
  position: SidebarPosition.RIGHT,
  primaryModel: GeminiModel.FLASH,
  dripFeed: false,
  autoStopOnError: false,
  autoCaption: false,
  globalNegatives: "",
  globalNegativesEnabled: false,
  theme: ThemeMode.DARK,
  defaultTool: GeminiTool.IMAGE,
  toolSequence: [GeminiTool.IMAGE, GeminiTool.VIDEO, GeminiTool.CANVAS],
  useToolSequence: false,
  aiApiKeys: {},
  preferredAIProvider: AIProvider.GEMINI,
  sidebarWidth: 320,
  retryConfig: {
    enabled: true,
    maxAttempts: 3,
    baseDelayMs: 5000,
    maxDelayMs: 300000,
    autoRetry: true,
  },
  globalVariables: [],
  schedule: {
    enabled: false,
    scheduledTime: null,
    repeatDaily: false,
  },
  analyticsEnabled: true,
};

/**
 * Get application settings from storage
 */
export async function getSettings(): Promise<AppSettings> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
    const stored = result[STORAGE_KEYS.SETTINGS] as Partial<AppSettings> | undefined;

    if (!stored) {
      return DEFAULT_SETTINGS;
    }

    // Merge with defaults to ensure all fields are present
    return {
      ...DEFAULT_SETTINGS,
      ...stored,
      aiApiKeys: {
        ...DEFAULT_SETTINGS.aiApiKeys,
        ...stored.aiApiKeys,
      },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Update application settings in storage
 */
export async function setSettings(updates: Partial<AppSettings>): Promise<void> {
  try {
    const current = await getSettings();
    const merged = {
      ...current,
      ...updates,
      aiApiKeys: {
        ...current.aiApiKeys,
        ...updates.aiApiKeys,
      },
    };
    await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: merged });
  } catch (error) {
    throw error;
  }
}

export class StorageQuotaError extends Error {
  constructor(
    message = "Storage quota exceeded. Try clearing completed items or removing images from prompts."
  ) {
    super(message);
    this.name = "StorageQuotaError";
  }
}

export async function getQueue(): Promise<QueueItem[]> {
  return getAllQueueItems();
}

export async function setQueue(queue: QueueItem[]): Promise<void> {
  await setAllQueueItems(queue);
}

export async function updateQueueItem(id: string, updates: Partial<QueueItem>): Promise<void> {
  await updateQueueItemInDb(id, updates);
}

export { onQueueChangeDb as onQueueChange };

export async function initializeQueueStorage(): Promise<void> {
  await migrateFromChromeStorage();
  await requestPersistentStorage();
}

/**
 * Get folders from storage
 */
export async function getFolders(): Promise<Folder[]> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.FOLDERS);
    return (result[STORAGE_KEYS.FOLDERS] as Folder[]) ?? [];
  } catch {
    return [];
  }
}

/**
 * Update folders in storage
 */
export async function setFolders(folders: Folder[]): Promise<void> {
  try {
    await chrome.storage.local.set({ [STORAGE_KEYS.FOLDERS]: folders });
  } catch (error) {
    throw error;
  }
}

/**
 * Check if onboarding is complete
 */
export async function isOnboardingComplete(): Promise<boolean> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.ONBOARDING_COMPLETE);
    return (result[STORAGE_KEYS.ONBOARDING_COMPLETE] as boolean) ?? false;
  } catch {
    return false;
  }
}

/**
 * Set onboarding complete status
 */
export async function setOnboardingComplete(complete: boolean): Promise<void> {
  try {
    await chrome.storage.local.set({ [STORAGE_KEYS.ONBOARDING_COMPLETE]: complete });
  } catch (error) {
    throw error;
  }
}

/**
 * Listen to storage changes
 */
export function onStorageChange(
  callback: (changes: Record<string, chrome.storage.StorageChange>) => void
): () => void {
  const listener = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
    if (areaName === "local") {
      callback(changes);
    }
  };

  chrome.storage.onChanged.addListener(listener);

  // Return cleanup function
  return () => {
    chrome.storage.onChanged.removeListener(listener);
  };
}

/**
 * Get API key for a specific AI provider
 */
export async function getAIApiKey(provider: AIProvider): Promise<string | undefined> {
  try {
    const settings = await getSettings();
    const keyMap: Record<AIProvider, keyof AIApiKeys> = {
      [AIProvider.GEMINI]: "gemini",
      [AIProvider.OPENAI]: "openai",
      [AIProvider.ANTHROPIC]: "anthropic",
    };

    const keyName = keyMap[provider];
    const key = settings.aiApiKeys?.[keyName];

    if (key) {
      return key;
    }

    // Fallback to deprecated apiKey for GEMINI if new structure doesn't have it
    // This maintains backward compatibility
    if (provider === AIProvider.GEMINI && settings.apiKey) {
      return settings.apiKey;
    }

    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Get the preferred AI provider's API key from settings
 */
export function getPreferredAIKey(
  settings: AppSettings
): { provider: AIProvider; key: string } | null {
  const { preferredAIProvider, aiApiKeys } = settings;

  const keyMap: Record<AIProvider, keyof AIApiKeys> = {
    [AIProvider.GEMINI]: "gemini",
    [AIProvider.OPENAI]: "openai",
    [AIProvider.ANTHROPIC]: "anthropic",
  };

  const keyName = keyMap[preferredAIProvider];
  const key = aiApiKeys?.[keyName];

  if (key) {
    return { provider: preferredAIProvider, key };
  }

  // Fallback: try to find any configured key
  for (const [provider, keyName] of Object.entries(keyMap)) {
    const apiKey = aiApiKeys?.[keyName];
    if (apiKey) {
      return { provider: provider as AIProvider, key: apiKey };
    }
  }

  // Final fallback: check deprecated apiKey for GEMINI
  if (settings.apiKey) {
    return { provider: AIProvider.GEMINI, key: settings.apiKey };
  }

  return null;
}

/**
 * Check if any AI API key is configured
 */
export function hasAnyAIKey(settings: AppSettings): boolean {
  const { aiApiKeys, apiKey } = settings;

  // Check new structure
  if (aiApiKeys) {
    if (aiApiKeys.gemini || aiApiKeys.openai || aiApiKeys.anthropic) {
      return true;
    }
  }

  // Fallback to deprecated apiKey
  return Boolean(apiKey);
}

/**
 * Get extension enabled state
 */
export async function isExtensionEnabled(): Promise<boolean> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.EXTENSION_ENABLED);
    return (result[STORAGE_KEYS.EXTENSION_ENABLED] as boolean) ?? true; // Default to enabled
  } catch {
    return true;
  }
}

/**
 * Set extension enabled state
 */
export async function setExtensionEnabled(enabled: boolean): Promise<void> {
  try {
    await chrome.storage.local.set({ [STORAGE_KEYS.EXTENSION_ENABLED]: enabled });
  } catch (error) {
    throw error;
  }
}

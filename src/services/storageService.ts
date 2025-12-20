import {
  AIProvider,
  GeminiModel,
  GeminiTool,
  STORAGE_KEYS,
  SidebarPosition,
  ThemeMode,
} from "@/types";

import type { AIApiKeys, AppSettings, Folder, QueueItem, StorageKey } from "@/types";

// Default values for the application
export const DEFAULT_SETTINGS: AppSettings = {
  prefix: "",
  suffix: "",
  position: SidebarPosition.LEFT,
  primaryModel: GeminiModel.FLASH,
  dripFeed: false,
  autoCaption: true,
  globalNegatives: "extra fingers, deformed limbs, blurry, low resolution",
  globalNegativesEnabled: true,
  theme: ThemeMode.DARK,
  // Tool settings
  defaultTool: GeminiTool.IMAGE,
  toolSequence: [GeminiTool.IMAGE],
  useToolSequence: false,
  // AI Provider settings
  aiApiKeys: {},
  preferredAIProvider: AIProvider.GEMINI,
};

export const DEFAULT_FOLDERS: Folder[] = [
  {
    id: "getting-started",
    name: "Getting Started",
    isOpen: true,
    templates: [
      {
        id: "gs-1",
        name: "How Templates Work",
        text: "Templates are reusable prompts you can quickly add to your queue. Click the + button to use this template, or edit it to make it your own!",
        createdAt: Date.now(),
        lastEditedAt: Date.now(),
        timesUsed: 0,
        images: [],
      },
      {
        id: "gs-2",
        name: "Your First Prompt",
        text: "A cozy coffee shop on a rainy afternoon, warm golden lighting through foggy windows, steaming cup of coffee on a wooden table",
        createdAt: Date.now(),
        lastEditedAt: Date.now(),
        timesUsed: 0,
        images: [],
      },
    ],
  },
  {
    id: "inspiration",
    name: "Prompt Inspiration",
    isOpen: false,
    templates: [
      {
        id: "insp-1",
        name: "Dreamy Portrait",
        text: "Portrait of a person with soft bokeh background, golden hour lighting, film grain texture, shallow depth of field",
        createdAt: Date.now(),
        lastEditedAt: Date.now(),
        timesUsed: 0,
        images: [],
      },
      {
        id: "insp-2",
        name: "Fantasy Landscape",
        text: "Floating islands in a pastel sunset sky, waterfalls cascading into clouds, ancient trees with glowing leaves, Studio Ghibli inspired",
        createdAt: Date.now(),
        lastEditedAt: Date.now(),
        timesUsed: 0,
        images: [],
      },
      {
        id: "insp-3",
        name: "Urban Night Scene",
        text: "Neon-lit city street at midnight, rain-soaked pavement reflecting colorful signs, lone figure with umbrella, cyberpunk atmosphere",
        createdAt: Date.now(),
        lastEditedAt: Date.now(),
        timesUsed: 0,
        images: [],
      },
    ],
  },
];

/**
 * Get data from Chrome storage
 */
export async function getFromStorage<T>(key: StorageKey): Promise<T | null> {
  try {
    const result = await chrome.storage.local.get(key);
    return result[key] ?? null;
  } catch (error) {
    console.error(`Error getting ${key} from storage:`, error);
    return null;
  }
}

/**
 * Set data in Chrome storage
 */
export async function setInStorage<T>(key: StorageKey, value: T): Promise<boolean> {
  try {
    await chrome.storage.local.set({ [key]: value });
    return true;
  } catch (error) {
    console.error(`Error setting ${key} in storage:`, error);
    return false;
  }
}

/**
 * Remove data from Chrome storage
 */
export async function removeFromStorage(key: StorageKey): Promise<boolean> {
  try {
    await chrome.storage.local.remove(key);
    return true;
  } catch (error) {
    console.error(`Error removing ${key} from storage:`, error);
    return false;
  }
}

// Queue Operations
export async function getQueue(): Promise<QueueItem[]> {
  const queue = await getFromStorage<QueueItem[]>(STORAGE_KEYS.QUEUE);
  return queue ?? [];
}

export async function setQueue(queue: QueueItem[]): Promise<boolean> {
  return setInStorage(STORAGE_KEYS.QUEUE, queue);
}

export async function addToQueue(items: QueueItem[]): Promise<boolean> {
  const currentQueue = await getQueue();
  return setQueue([...currentQueue, ...items]);
}

export async function updateQueueItem(id: string, updates: Partial<QueueItem>): Promise<boolean> {
  const queue = await getQueue();
  const updatedQueue = queue.map((item) => (item.id === id ? { ...item, ...updates } : item));
  return setQueue(updatedQueue);
}

export async function removeFromQueue(id: string): Promise<boolean> {
  const queue = await getQueue();
  return setQueue(queue.filter((item) => item.id !== id));
}

export async function clearCompletedFromQueue(): Promise<boolean> {
  const queue = await getQueue();
  return setQueue(queue.filter((item) => item.status !== "COMPLETED"));
}

// Settings Operations
export async function getSettings(): Promise<AppSettings> {
  const settings = await getFromStorage<AppSettings>(STORAGE_KEYS.SETTINGS);
  const mergedSettings = { ...DEFAULT_SETTINGS, ...settings };

  // Migrate legacy apiKey to aiApiKeys.gemini if needed
  if (mergedSettings.apiKey && !mergedSettings.aiApiKeys?.gemini) {
    mergedSettings.aiApiKeys = {
      ...mergedSettings.aiApiKeys,
      gemini: mergedSettings.apiKey,
    };
  }

  // Ensure aiApiKeys object exists
  if (!mergedSettings.aiApiKeys) {
    mergedSettings.aiApiKeys = {};
  }

  return mergedSettings;
}

export async function setSettings(settings: AppSettings): Promise<boolean> {
  return setInStorage(STORAGE_KEYS.SETTINGS, settings);
}

export async function updateSettings(updates: Partial<AppSettings>): Promise<boolean> {
  const currentSettings = await getSettings();
  return setSettings({ ...currentSettings, ...updates });
}

// Folders Operations
export async function getFolders(): Promise<Folder[]> {
  const folders = await getFromStorage<Folder[]>(STORAGE_KEYS.FOLDERS);
  return folders ?? DEFAULT_FOLDERS;
}

export async function setFolders(folders: Folder[]): Promise<boolean> {
  return setInStorage(STORAGE_KEYS.FOLDERS, folders);
}

export async function addFolder(folder: Folder): Promise<boolean> {
  const folders = await getFolders();
  return setFolders([...folders, folder]);
}

export async function updateFolder(id: string, updates: Partial<Folder>): Promise<boolean> {
  const folders = await getFolders();
  const updatedFolders = folders.map((folder) =>
    folder.id === id ? { ...folder, ...updates } : folder
  );
  return setFolders(updatedFolders);
}

export async function removeFolder(id: string): Promise<boolean> {
  const folders = await getFolders();
  return setFolders(folders.filter((folder) => folder.id !== id));
}

// Onboarding Operations
export async function isOnboardingComplete(): Promise<boolean> {
  const complete = await getFromStorage<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETE);
  return complete ?? false;
}

export async function setOnboardingComplete(complete: boolean): Promise<boolean> {
  return setInStorage(STORAGE_KEYS.ONBOARDING_COMPLETE, complete);
}

// API Key Operations (stored securely in settings)
/** @deprecated Use getAIApiKey instead */
export async function getApiKey(): Promise<string | undefined> {
  const settings = await getSettings();
  // Return from new location first, fall back to legacy
  return settings.aiApiKeys?.gemini || settings.apiKey;
}

/** @deprecated Use setAIApiKey instead */
export async function setApiKey(apiKey: string): Promise<boolean> {
  return updateSettings({ apiKey });
}

// AI Provider API Key Operations
export async function getAIApiKey(provider: AIProvider): Promise<string | undefined> {
  const settings = await getSettings();
  return settings.aiApiKeys?.[provider];
}

export async function setAIApiKey(provider: AIProvider, apiKey: string): Promise<boolean> {
  const settings = await getSettings();
  const updatedKeys: AIApiKeys = {
    ...settings.aiApiKeys,
    [provider]: apiKey || undefined, // Remove key if empty string
  };
  return updateSettings({ aiApiKeys: updatedKeys });
}

export async function removeAIApiKey(provider: AIProvider): Promise<boolean> {
  const settings = await getSettings();
  const updatedKeys: AIApiKeys = { ...settings.aiApiKeys };
  delete updatedKeys[provider];
  return updateSettings({ aiApiKeys: updatedKeys });
}

/**
 * Check if any AI API key is configured
 */
export function hasAnyAIKey(settings: AppSettings): boolean {
  const keys = settings.aiApiKeys || {};
  return !!(keys.gemini || keys.openai || keys.anthropic);
}

/**
 * Get the API key for the preferred provider, or first available key
 */
export function getPreferredAIKey(
  settings: AppSettings
): { provider: AIProvider; key: string } | null {
  const keys = settings.aiApiKeys || {};

  // Try preferred provider first
  if (keys[settings.preferredAIProvider]) {
    return { provider: settings.preferredAIProvider, key: keys[settings.preferredAIProvider]! };
  }

  // Fall back to first available key (priority: gemini > openai > anthropic)
  if (keys.gemini) return { provider: AIProvider.GEMINI, key: keys.gemini };
  if (keys.openai) return { provider: AIProvider.OPENAI, key: keys.openai };
  if (keys.anthropic) return { provider: AIProvider.ANTHROPIC, key: keys.anthropic };

  return null;
}

// Listen for storage changes
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

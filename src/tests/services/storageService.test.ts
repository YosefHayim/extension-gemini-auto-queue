import { beforeEach, describe, expect, it } from "vitest";

import {
  DEFAULT_SETTINGS,
  getPreferredAIKey,
  getSettings,
  getFolders,
  hasAnyAIKey,
  isExtensionEnabled,
  isOnboardingComplete,
  setExtensionEnabled,
  setFolders,
  setOnboardingComplete,
  setSettings,
} from "@/backend/services/storageService";
import { AIProvider, STORAGE_KEYS } from "@/backend/types";

import { clearMockStorage, mockChromeStorage, setMockStorageData } from "../setup";

describe("storageService", () => {
  beforeEach(() => {
    clearMockStorage();
  });

  describe("getSettings", () => {
    it("should return default settings when storage is empty", async () => {
      const settings = await getSettings();

      expect(settings).toEqual(DEFAULT_SETTINGS);
    });

    it("should return stored settings merged with defaults", async () => {
      const partialSettings = {
        prefix: "Test prefix",
        dripFeed: true,
      };
      setMockStorageData(STORAGE_KEYS.SETTINGS, partialSettings);

      const settings = await getSettings();

      expect(settings.prefix).toBe("Test prefix");
      expect(settings.dripFeed).toBe(true);
      expect(settings.suffix).toBe(DEFAULT_SETTINGS.suffix);
    });

    it("should merge aiApiKeys with defaults", async () => {
      const storedSettings = {
        aiApiKeys: {
          gemini: "test-gemini-key",
        },
      };
      setMockStorageData(STORAGE_KEYS.SETTINGS, storedSettings);

      const settings = await getSettings();

      expect(settings.aiApiKeys.gemini).toBe("test-gemini-key");
      expect(settings.aiApiKeys.openai).toBeUndefined();
    });
  });

  describe("setSettings", () => {
    it("should store settings in chrome storage", async () => {
      await setSettings({ prefix: "New prefix" });

      const stored = mockChromeStorage[STORAGE_KEYS.SETTINGS] as Record<string, unknown>;
      expect(stored.prefix).toBe("New prefix");
    });

    it("should merge with existing settings", async () => {
      await setSettings({ prefix: "First" });
      await setSettings({ suffix: "Second" });

      const stored = mockChromeStorage[STORAGE_KEYS.SETTINGS] as Record<string, unknown>;
      expect(stored.prefix).toBe("First");
      expect(stored.suffix).toBe("Second");
    });

    it("should merge aiApiKeys correctly", async () => {
      await setSettings({ aiApiKeys: { gemini: "key1" } });
      await setSettings({ aiApiKeys: { openai: "key2" } });

      const stored = mockChromeStorage[STORAGE_KEYS.SETTINGS] as Record<
        string,
        Record<string, unknown>
      >;
      expect(stored.aiApiKeys.gemini).toBe("key1");
      expect(stored.aiApiKeys.openai).toBe("key2");
    });
  });

  describe("getFolders", () => {
    it("should return empty array when no folders exist", async () => {
      const folders = await getFolders();

      expect(folders).toEqual([]);
    });

    it("should return stored folders", async () => {
      const testFolders = [
        { id: "1", name: "Folder 1", templates: [], isOpen: false },
        { id: "2", name: "Folder 2", templates: [], isOpen: true },
      ];
      setMockStorageData(STORAGE_KEYS.FOLDERS, testFolders);

      const folders = await getFolders();

      expect(folders).toHaveLength(2);
      expect(folders[0].name).toBe("Folder 1");
    });
  });

  describe("setFolders", () => {
    it("should store folders in chrome storage", async () => {
      const testFolders = [{ id: "1", name: "Test Folder", templates: [], isOpen: false }];

      await setFolders(testFolders);

      expect(mockChromeStorage[STORAGE_KEYS.FOLDERS]).toEqual(testFolders);
    });
  });

  describe("isOnboardingComplete", () => {
    it("should return false when not set", async () => {
      const complete = await isOnboardingComplete();

      expect(complete).toBe(false);
    });

    it("should return stored value", async () => {
      setMockStorageData(STORAGE_KEYS.ONBOARDING_COMPLETE, true);

      const complete = await isOnboardingComplete();

      expect(complete).toBe(true);
    });
  });

  describe("setOnboardingComplete", () => {
    it("should store onboarding status", async () => {
      await setOnboardingComplete(true);

      expect(mockChromeStorage[STORAGE_KEYS.ONBOARDING_COMPLETE]).toBe(true);
    });
  });

  describe("isExtensionEnabled", () => {
    it("should return true by default", async () => {
      const enabled = await isExtensionEnabled();

      expect(enabled).toBe(true);
    });

    it("should return stored value", async () => {
      setMockStorageData(STORAGE_KEYS.EXTENSION_ENABLED, false);

      const enabled = await isExtensionEnabled();

      expect(enabled).toBe(false);
    });
  });

  describe("setExtensionEnabled", () => {
    it("should store enabled state", async () => {
      await setExtensionEnabled(false);

      expect(mockChromeStorage[STORAGE_KEYS.EXTENSION_ENABLED]).toBe(false);
    });
  });

  describe("hasAnyAIKey", () => {
    it("should return false when no keys configured", () => {
      const settings = { ...DEFAULT_SETTINGS, aiApiKeys: {} };

      expect(hasAnyAIKey(settings)).toBe(false);
    });

    it("should return true when gemini key is configured", () => {
      const settings = { ...DEFAULT_SETTINGS, aiApiKeys: { gemini: "test-key" } };

      expect(hasAnyAIKey(settings)).toBe(true);
    });

    it("should return true when any key is configured", () => {
      const settings = { ...DEFAULT_SETTINGS, aiApiKeys: { openai: "test-key" } };

      expect(hasAnyAIKey(settings)).toBe(true);
    });

    it("should return true for deprecated apiKey field", () => {
      const settings = { ...DEFAULT_SETTINGS, apiKey: "legacy-key", aiApiKeys: {} };

      expect(hasAnyAIKey(settings)).toBe(true);
    });
  });

  describe("getPreferredAIKey", () => {
    it("should return null when no keys configured", () => {
      const settings = {
        ...DEFAULT_SETTINGS,
        preferredAIProvider: AIProvider.GEMINI,
        aiApiKeys: {},
      };

      expect(getPreferredAIKey(settings)).toBeNull();
    });

    it("should return preferred provider key", () => {
      const settings = {
        ...DEFAULT_SETTINGS,
        preferredAIProvider: AIProvider.GEMINI,
        aiApiKeys: { gemini: "gemini-key", openai: "openai-key" },
      };

      const result = getPreferredAIKey(settings);

      expect(result?.provider).toBe(AIProvider.GEMINI);
      expect(result?.key).toBe("gemini-key");
    });

    it("should fallback to any available key", () => {
      const settings = {
        ...DEFAULT_SETTINGS,
        preferredAIProvider: AIProvider.GEMINI,
        aiApiKeys: { openai: "openai-key" },
      };

      const result = getPreferredAIKey(settings);

      expect(result?.provider).toBe(AIProvider.OPENAI);
      expect(result?.key).toBe("openai-key");
    });

    it("should fallback to deprecated apiKey", () => {
      const settings = {
        ...DEFAULT_SETTINGS,
        apiKey: "legacy-key",
        preferredAIProvider: AIProvider.GEMINI,
        aiApiKeys: {},
      };

      const result = getPreferredAIKey(settings);

      expect(result?.provider).toBe(AIProvider.GEMINI);
      expect(result?.key).toBe("legacy-key");
    });
  });
});

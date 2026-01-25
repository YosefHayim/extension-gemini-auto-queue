import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { STORAGE_KEYS } from "@/backend/types";
import { useStorage, useStorageListener } from "@/extension/hooks/useStorage";

import {
  mockChromeStorage,
  mockChromeStorageListeners,
  setMockStorageData,
  clearMockStorage,
} from "../setup";

describe("useStorage", () => {
  beforeEach(() => {
    clearMockStorage();
  });

  describe("initialization", () => {
    it("should return default value initially", () => {
      const { result } = renderHook(() => useStorage(STORAGE_KEYS.SETTINGS, { theme: "light" }));

      const [value, , isLoading] = result.current;
      expect(value).toEqual({ theme: "light" });
      expect(isLoading).toBe(true);
    });

    it("should load value from storage", async () => {
      setMockStorageData(STORAGE_KEYS.SETTINGS, { theme: "dark" });

      const { result } = renderHook(() => useStorage(STORAGE_KEYS.SETTINGS, { theme: "light" }));

      await waitFor(() => {
        expect(result.current[2]).toBe(false); // isLoading
      });

      expect(result.current[0]).toEqual({ theme: "dark" });
    });

    it("should use default value when storage is empty", async () => {
      const { result } = renderHook(() =>
        useStorage(STORAGE_KEYS.SETTINGS, { defaultKey: "defaultValue" })
      );

      await waitFor(() => {
        expect(result.current[2]).toBe(false); // isLoading
      });

      expect(result.current[0]).toEqual({ defaultKey: "defaultValue" });
    });
  });

  describe("setValue", () => {
    it("should update local state immediately", async () => {
      const { result } = renderHook(() => useStorage(STORAGE_KEYS.SETTINGS, { count: 0 }));

      await waitFor(() => {
        expect(result.current[2]).toBe(false);
      });

      await act(async () => {
        await result.current[1]({ count: 5 });
      });

      expect(result.current[0]).toEqual({ count: 5 });
    });

    it("should persist value to chrome storage", async () => {
      const { result } = renderHook(() => useStorage(STORAGE_KEYS.SETTINGS, { name: "initial" }));

      await waitFor(() => {
        expect(result.current[2]).toBe(false);
      });

      await act(async () => {
        await result.current[1]({ name: "updated" });
      });

      expect(mockChromeStorage[STORAGE_KEYS.SETTINGS]).toEqual({ name: "updated" });
    });

    it("should support functional updates", async () => {
      setMockStorageData(STORAGE_KEYS.SETTINGS, { count: 10 });

      const { result } = renderHook(() =>
        useStorage<{ count: number }>(STORAGE_KEYS.SETTINGS, { count: 0 })
      );

      await waitFor(() => {
        expect(result.current[2]).toBe(false);
      });

      await act(async () => {
        await result.current[1]((prev) => ({ count: prev.count + 5 }));
      });

      expect(result.current[0]).toEqual({ count: 15 });
      expect(mockChromeStorage[STORAGE_KEYS.SETTINGS]).toEqual({ count: 15 });
    });
  });

  describe("storage change listener", () => {
    it("should update when storage changes externally", async () => {
      const { result } = renderHook(() => useStorage(STORAGE_KEYS.SETTINGS, { value: "initial" }));

      await waitFor(() => {
        expect(result.current[2]).toBe(false);
      });

      // Simulate external storage change
      act(() => {
        const changes: Record<string, chrome.storage.StorageChange> = {
          [STORAGE_KEYS.SETTINGS]: {
            oldValue: { value: "initial" },
            newValue: { value: "external" },
          },
        };
        for (const listener of mockChromeStorageListeners) {
          listener(changes, "local");
        }
      });

      expect(result.current[0]).toEqual({ value: "external" });
    });

    it("should use default value when storage value is cleared", async () => {
      setMockStorageData(STORAGE_KEYS.SETTINGS, { value: "stored" });

      const { result } = renderHook(() => useStorage(STORAGE_KEYS.SETTINGS, { value: "default" }));

      await waitFor(() => {
        expect(result.current[2]).toBe(false);
      });

      expect(result.current[0]).toEqual({ value: "stored" });

      // Simulate storage being cleared
      act(() => {
        const changes: Record<string, chrome.storage.StorageChange> = {
          [STORAGE_KEYS.SETTINGS]: {
            oldValue: { value: "stored" },
            newValue: undefined,
          },
        };
        for (const listener of mockChromeStorageListeners) {
          listener(changes, "local");
        }
      });

      expect(result.current[0]).toEqual({ value: "default" });
    });

    it("should ignore changes from other storage areas", async () => {
      const { result } = renderHook(() => useStorage(STORAGE_KEYS.SETTINGS, { value: "initial" }));

      await waitFor(() => {
        expect(result.current[2]).toBe(false);
      });

      // Simulate sync storage change (should be ignored)
      act(() => {
        const changes: Record<string, chrome.storage.StorageChange> = {
          [STORAGE_KEYS.SETTINGS]: {
            oldValue: { value: "initial" },
            newValue: { value: "sync" },
          },
        };
        for (const listener of mockChromeStorageListeners) {
          listener(changes, "sync"); // Different area
        }
      });

      expect(result.current[0]).toEqual({ value: "initial" });
    });

    it("should ignore changes for different keys", async () => {
      const { result } = renderHook(() => useStorage(STORAGE_KEYS.SETTINGS, { value: "settings" }));

      await waitFor(() => {
        expect(result.current[2]).toBe(false);
      });

      // Simulate change to different key
      act(() => {
        const changes: Record<string, chrome.storage.StorageChange> = {
          [STORAGE_KEYS.FOLDERS]: {
            oldValue: [],
            newValue: [{ id: "1", name: "folder" }],
          },
        };
        for (const listener of mockChromeStorageListeners) {
          listener(changes, "local");
        }
      });

      expect(result.current[0]).toEqual({ value: "settings" });
    });
  });

  describe("cleanup", () => {
    it("should remove listener on unmount", () => {
      const { unmount } = renderHook(() => useStorage(STORAGE_KEYS.SETTINGS, { value: "test" }));

      const listenersBeforeUnmount = mockChromeStorageListeners.length;
      expect(listenersBeforeUnmount).toBeGreaterThan(0);

      unmount();

      expect(mockChromeStorageListeners.length).toBe(listenersBeforeUnmount - 1);
    });
  });

  describe("error handling", () => {
    it("should handle storage.get errors gracefully", async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      vi.mocked(chrome.storage.local.get).mockRejectedValueOnce(new Error("Storage error"));

      const { result } = renderHook(() => useStorage(STORAGE_KEYS.SETTINGS, { fallback: true }));

      await waitFor(() => {
        expect(result.current[2]).toBe(false);
      });

      expect(result.current[0]).toEqual({ fallback: true });
    });

    it("should handle storage.set errors gracefully", async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      vi.mocked(chrome.storage.local.set).mockRejectedValueOnce(new Error("Write error"));

      const { result } = renderHook(() => useStorage(STORAGE_KEYS.SETTINGS, { value: "initial" }));

      await waitFor(() => {
        expect(result.current[2]).toBe(false);
      });

      // Should not throw when set fails
      await act(async () => {
        await result.current[1]({ value: "new" });
      });

      // Local state should still update even if storage fails
      expect(result.current[0]).toEqual({ value: "new" });
    });
  });

  describe("different data types", () => {
    it("should work with string values", async () => {
      setMockStorageData(STORAGE_KEYS.SETTINGS, "stored-string");

      const { result } = renderHook(() => useStorage<string>(STORAGE_KEYS.SETTINGS, "default"));

      await waitFor(() => {
        expect(result.current[2]).toBe(false);
      });

      expect(result.current[0]).toBe("stored-string");
    });

    it("should work with boolean values", async () => {
      setMockStorageData(STORAGE_KEYS.ONBOARDING_COMPLETE, true);

      const { result } = renderHook(() =>
        useStorage<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETE, false)
      );

      await waitFor(() => {
        expect(result.current[2]).toBe(false);
      });

      expect(result.current[0]).toBe(true);
    });

    it("should work with array values", async () => {
      setMockStorageData(STORAGE_KEYS.FOLDERS, [
        { id: "1", name: "Folder 1" },
        { id: "2", name: "Folder 2" },
      ]);

      const { result } = renderHook(() =>
        useStorage<{ id: string; name: string }[]>(STORAGE_KEYS.FOLDERS, [])
      );

      await waitFor(() => {
        expect(result.current[2]).toBe(false);
      });

      expect(result.current[0]).toHaveLength(2);
      expect(result.current[0][0].name).toBe("Folder 1");
    });
  });
});

describe("useStorageListener", () => {
  beforeEach(() => {
    clearMockStorage();
  });

  it("should call callback when storage changes", () => {
    const callback = vi.fn();

    renderHook(() => useStorageListener(callback));

    // Simulate storage change
    act(() => {
      const changes: Record<string, chrome.storage.StorageChange> = {
        [STORAGE_KEYS.SETTINGS]: {
          oldValue: undefined,
          newValue: { theme: "dark" },
        },
      };
      for (const listener of mockChromeStorageListeners) {
        listener(changes, "local");
      }
    });

    expect(callback).toHaveBeenCalledWith({
      [STORAGE_KEYS.SETTINGS]: {
        oldValue: undefined,
        newValue: { theme: "dark" },
      },
    });
  });

  it("should not call callback for non-local storage changes", () => {
    const callback = vi.fn();

    renderHook(() => useStorageListener(callback));

    // Simulate sync storage change
    act(() => {
      const changes: Record<string, chrome.storage.StorageChange> = {
        [STORAGE_KEYS.SETTINGS]: {
          oldValue: undefined,
          newValue: { theme: "dark" },
        },
      };
      for (const listener of mockChromeStorageListeners) {
        listener(changes, "sync");
      }
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("should remove listener on unmount", () => {
    const callback = vi.fn();

    const { unmount } = renderHook(() => useStorageListener(callback));

    const listenersBeforeUnmount = mockChromeStorageListeners.length;
    unmount();

    expect(mockChromeStorageListeners.length).toBe(listenersBeforeUnmount - 1);
  });
});

import { useCallback, useEffect, useState } from "react";

import type { StorageKey } from "@/backend/types";

/**
 * React hook for syncing state with Chrome storage
 * @param key - Storage key to sync with
 * @param defaultValue - Default value if nothing is stored
 * @returns [value, setValue, isLoading] tuple
 */
export function useStorage<T>(
  key: StorageKey,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => Promise<void>, boolean] {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial value
  useEffect(() => {
    const loadValue = async () => {
      try {
        const result = await chrome.storage.local.get(key);
        if (result[key] !== undefined) {
          setValue(result[key] as T);
        }
      } catch {
        // Error loading from storage
      } finally {
        setIsLoading(false);
      }
    };

    loadValue();
  }, [key]);

  // Listen for storage changes
  useEffect(() => {
    const handleChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string
    ) => {
      if (areaName === "local" && changes[key]) {
        setValue((changes[key].newValue as T) ?? defaultValue);
      }
    };

    chrome.storage.onChanged.addListener(handleChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleChange);
    };
  }, [key, defaultValue]);

  // Set value in state and storage
  const setStoredValue = useCallback(
    async (newValue: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          typeof newValue === "function" ? (newValue as (prev: T) => T)(value) : newValue;

        setValue(valueToStore);
        await chrome.storage.local.set({ [key]: valueToStore }).catch(() => {});
      } catch {
        // Error setting in storage
      }
    },
    [key, value]
  );

  return [value, setStoredValue, isLoading];
}

/**
 * Hook for listening to storage changes without managing state
 * @param callback - Function to call when storage changes
 * @returns Cleanup function
 */
export function useStorageListener(
  callback: (changes: Record<string, chrome.storage.StorageChange>) => void
): void {
  useEffect(() => {
    const handleChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string
    ) => {
      if (areaName === "local") {
        callback(changes);
      }
    };

    chrome.storage.onChanged.addListener(handleChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleChange);
    };
  }, [callback]);
}

export default useStorage;

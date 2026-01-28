/* eslint-disable @typescript-eslint/no-dynamic-delete, @typescript-eslint/no-misused-spread */
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

import "@testing-library/jest-dom/vitest";

type StorageChangeListener = (
  changes: Record<string, chrome.storage.StorageChange>,
  areaName: string
) => void;

export const mockChromeStorage: Record<string, unknown> = {};
export const mockChromeStorageListeners: StorageChangeListener[] = [];

export const mockChrome = {
  runtime: {
    id: "test-extension-id",
    getURL: vi.fn((path: string) => `chrome-extension://test-extension-id${path}`),
    sendMessage: vi.fn().mockResolvedValue(undefined),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn().mockReturnValue(false),
    },
    onConnect: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    connect: vi.fn().mockReturnValue({
      postMessage: vi.fn(),
      onMessage: { addListener: vi.fn(), removeListener: vi.fn() },
      onDisconnect: { addListener: vi.fn(), removeListener: vi.fn() },
      disconnect: vi.fn(),
    }),
    getManifest: vi.fn().mockReturnValue({
      name: "PromptQueue",
      version: "2.2.0",
      manifest_version: 3,
    }),
  },
  storage: {
    local: {
      get: vi.fn((keys: string | string[] | null) => {
        if (keys === null) {
          return Promise.resolve(mockChromeStorage);
        }
        const keyArray = Array.isArray(keys) ? keys : [keys];
        const result: Record<string, unknown> = {};
        for (const key of keyArray) {
          if (key in mockChromeStorage) {
            result[key] = mockChromeStorage[key];
          }
        }
        return Promise.resolve(result);
      }),
      set: vi.fn((items: Record<string, unknown>) => {
        const changes: Record<string, chrome.storage.StorageChange> = {};
        for (const [key, newValue] of Object.entries(items)) {
          changes[key] = { oldValue: mockChromeStorage[key], newValue };
          mockChromeStorage[key] = newValue;
        }
        for (const listener of mockChromeStorageListeners) {
          listener(changes, "local");
        }
        return Promise.resolve();
      }),
      remove: vi.fn((keys: string | string[]) => {
        const keyArray = Array.isArray(keys) ? keys : [keys];
        const changes: Record<string, chrome.storage.StorageChange> = {};
        for (const key of keyArray) {
          if (key in mockChromeStorage) {
            changes[key] = { oldValue: mockChromeStorage[key], newValue: undefined };
            delete mockChromeStorage[key];
          }
        }
        for (const listener of mockChromeStorageListeners) {
          listener(changes, "local");
        }
        return Promise.resolve();
      }),
      clear: vi.fn(() => {
        const changes: Record<string, chrome.storage.StorageChange> = {};
        for (const key of Object.keys(mockChromeStorage)) {
          changes[key] = { oldValue: mockChromeStorage[key], newValue: undefined };
          delete mockChromeStorage[key];
        }
        for (const listener of mockChromeStorageListeners) {
          listener(changes, "local");
        }
        return Promise.resolve();
      }),
    },
    session: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn().mockResolvedValue(undefined),
    },
    onChanged: {
      addListener: vi.fn((listener: StorageChangeListener) => {
        mockChromeStorageListeners.push(listener);
      }),
      removeListener: vi.fn((listener: StorageChangeListener) => {
        const index = mockChromeStorageListeners.indexOf(listener);
        if (index > -1) {
          mockChromeStorageListeners.splice(index, 1);
        }
      }),
    },
  },
  tabs: {
    query: vi.fn().mockResolvedValue([]),
    sendMessage: vi.fn().mockResolvedValue(undefined),
    create: vi.fn().mockResolvedValue({ id: 1 }),
    update: vi.fn().mockResolvedValue({}),
    remove: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockResolvedValue({ id: 1, url: "https://gemini.google.com" }),
    onUpdated: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    onRemoved: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    onActivated: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  alarms: {
    create: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(true),
    get: vi.fn().mockResolvedValue(null),
    getAll: vi.fn().mockResolvedValue([]),
    onAlarm: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  sidePanel: {
    open: vi.fn().mockResolvedValue(undefined),
    setOptions: vi.fn().mockResolvedValue(undefined),
    getOptions: vi.fn().mockResolvedValue({ enabled: true }),
  },
  identity: {
    getAuthToken: vi.fn().mockResolvedValue({ token: "test-auth-token" }),
    removeCachedAuthToken: vi.fn().mockResolvedValue(undefined),
    launchWebAuthFlow: vi.fn().mockResolvedValue("https://example.com?code=test-code"),
    getProfileUserInfo: vi.fn().mockResolvedValue({ email: "test@example.com", id: "123" }),
  },
  scripting: {
    executeScript: vi.fn().mockResolvedValue([{ result: true }]),
    insertCSS: vi.fn().mockResolvedValue(undefined),
  },
  downloads: {
    download: vi.fn().mockResolvedValue(1),
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
  action: {
    setBadgeText: vi.fn().mockResolvedValue(undefined),
    setBadgeBackgroundColor: vi.fn().mockResolvedValue(undefined),
    setIcon: vi.fn().mockResolvedValue(undefined),
  },
} as unknown as typeof chrome;

vi.stubGlobal("chrome", mockChrome);

interface MockIDBRequest {
  result: unknown;
  onsuccess: ((event: Event) => void) | null;
  onerror: ((event: Event) => void) | null;
}

interface MockIDBOpenRequest extends MockIDBRequest {
  onupgradeneeded: ((event: Event) => void) | null;
}

function createMockRequest(result: unknown): MockIDBRequest {
  const req: MockIDBRequest = { result, onsuccess: null, onerror: null };
  setTimeout(() => req.onsuccess?.({ target: req } as unknown as Event), 0);
  return req;
}

const mockIndexedDB = {
  databases: vi.fn().mockResolvedValue([]),
  deleteDatabase: vi.fn(),
  open: vi.fn().mockImplementation(() => {
    const request: MockIDBOpenRequest = {
      result: {
        objectStoreNames: { contains: vi.fn().mockReturnValue(true) },
        createObjectStore: vi.fn(),
        transaction: vi.fn().mockReturnValue({
          objectStore: vi.fn().mockReturnValue({
            getAll: vi.fn().mockImplementation(() => createMockRequest([])),
            get: vi.fn().mockImplementation(() => createMockRequest(null)),
            put: vi.fn().mockImplementation(() => createMockRequest(undefined)),
            delete: vi.fn().mockImplementation(() => createMockRequest(undefined)),
            clear: vi.fn().mockImplementation(() => createMockRequest(undefined)),
          }),
          oncomplete: null,
          onerror: null,
        }),
        close: vi.fn(),
        onclose: null,
      },
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
    };
    setTimeout(() => request.onsuccess?.({ target: request } as unknown as Event), 0);
    return request;
  }),
};

vi.stubGlobal("indexedDB", mockIndexedDB);

interface BroadcastMessage {
  type: string;
  data?: unknown;
}

type BroadcastMessageListener = (event: MessageEvent) => void;

export const mockBroadcastChannelMessages: BroadcastMessage[] = [];
const mockBroadcastChannelListeners: BroadcastMessageListener[] = [];

const MockBroadcastChannel = vi.fn().mockImplementation(() => ({
  postMessage: vi.fn((message: BroadcastMessage) => {
    mockBroadcastChannelMessages.push(message);
    for (const listener of mockBroadcastChannelListeners) {
      listener({ data: message } as MessageEvent);
    }
  }),
  addEventListener: vi.fn((event: string, listener: BroadcastMessageListener) => {
    if (event === "message") {
      mockBroadcastChannelListeners.push(listener);
    }
  }),
  removeEventListener: vi.fn((event: string, listener: BroadcastMessageListener) => {
    if (event === "message") {
      const index = mockBroadcastChannelListeners.indexOf(listener);
      if (index > -1) {
        mockBroadcastChannelListeners.splice(index, 1);
      }
    }
  }),
  close: vi.fn(),
}));

vi.stubGlobal("BroadcastChannel", MockBroadcastChannel);

vi.stubGlobal("navigator", {
  ...globalThis.navigator,
  storage: {
    persist: vi.fn().mockResolvedValue(true),
    persisted: vi.fn().mockResolvedValue(true),
    estimate: vi.fn().mockResolvedValue({ usage: 0, quota: 1000000000 }),
  },
});

vi.mock("posthog-js", () => ({
  default: {
    init: vi.fn(),
    capture: vi.fn(),
    identify: vi.fn(),
    reset: vi.fn(),
    opt_out_capturing: vi.fn(),
    opt_in_capturing: vi.fn(),
    has_opted_out_capturing: vi.fn().mockReturnValue(false),
  },
}));

vi.mock("@sentry/react", () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  setUser: vi.fn(),
  setContext: vi.fn(),
  setTag: vi.fn(),
  addBreadcrumb: vi.fn(),
  withScope: vi.fn((callback: (scope: { setExtra: () => void }) => void) =>
    callback({ setExtra: vi.fn() })
  ),
  startTransaction: vi.fn(() => ({
    finish: vi.fn(),
    setHttpStatus: vi.fn(),
  })),
}));

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("dark"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();

  for (const key of Object.keys(mockChromeStorage)) {
    delete mockChromeStorage[key];
  }
  mockChromeStorageListeners.length = 0;
  mockBroadcastChannelMessages.length = 0;
  mockBroadcastChannelListeners.length = 0;
});

afterAll(() => {
  vi.restoreAllMocks();
});

export function setMockStorageData(key: string, value: unknown): void {
  mockChromeStorage[key] = value;
}

export function getMockStorageData(key: string): unknown {
  return mockChromeStorage[key];
}

export function clearMockStorage(): void {
  for (const key of Object.keys(mockChromeStorage)) {
    delete mockChromeStorage[key];
  }
}

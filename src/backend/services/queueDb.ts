import type { QueueItem } from "@/backend/types";

const DB_NAME = "NanoFlowDB";
const DB_VERSION = 1;
const QUEUE_STORE = "queue";

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      dbPromise = null;
      reject(new Error("Failed to open IndexedDB"));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      dbInstance.onclose = () => {
        dbInstance = null;
        dbPromise = null;
      };
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: "id" });
      }
    };
  });

  return dbPromise;
}

export async function getAllQueueItems(): Promise<QueueItem[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(QUEUE_STORE, "readonly");
    const store = transaction.objectStore(QUEUE_STORE);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result as QueueItem[]);
    request.onerror = () => reject(new Error("Failed to get queue items"));
  });
}

export async function setAllQueueItems(items: QueueItem[]): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(QUEUE_STORE, "readwrite");
    const store = transaction.objectStore(QUEUE_STORE);

    store.clear();

    for (const item of items) {
      store.put(item);
    }

    transaction.oncomplete = () => {
      notifyQueueChange(items);
      resolve();
    };
    transaction.onerror = () => reject(new Error("Failed to save queue items"));
  });
}

export async function updateQueueItemInDb(id: string, updates: Partial<QueueItem>): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(QUEUE_STORE, "readwrite");
    const store = transaction.objectStore(QUEUE_STORE);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const existing = getRequest.result as QueueItem | undefined;
      if (existing) {
        const updated = { ...existing, ...updates };
        store.put(updated);
      }
    };

    transaction.oncomplete = async () => {
      const allItems = await getAllQueueItems();
      notifyQueueChange(allItems);
      resolve();
    };
    transaction.onerror = () => reject(new Error("Failed to update queue item"));
  });
}

export async function deleteQueueItem(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(QUEUE_STORE, "readwrite");
    const store = transaction.objectStore(QUEUE_STORE);
    store.delete(id);

    transaction.oncomplete = async () => {
      const allItems = await getAllQueueItems();
      notifyQueueChange(allItems);
      resolve();
    };
    transaction.onerror = () => reject(new Error("Failed to delete queue item"));
  });
}

export async function clearAllQueueItems(): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(QUEUE_STORE, "readwrite");
    const store = transaction.objectStore(QUEUE_STORE);
    store.clear();

    transaction.oncomplete = () => {
      notifyQueueChange([]);
      resolve();
    };
    transaction.onerror = () => reject(new Error("Failed to clear queue"));
  });
}

const QUEUE_CHANNEL_NAME = "nano_flow_queue_channel";
let broadcastChannel: BroadcastChannel | null = null;

function getBroadcastChannel(): BroadcastChannel {
  if (!broadcastChannel) {
    broadcastChannel = new BroadcastChannel(QUEUE_CHANNEL_NAME);
  }
  return broadcastChannel;
}

function notifyQueueChange(_queue: QueueItem[]): void {
  try {
    getBroadcastChannel().postMessage({ type: "QUEUE_UPDATED" });
  } catch {}
}

export function onQueueChange(callback: (queue: QueueItem[]) => void): () => void {
  const channel = getBroadcastChannel();
  const handler = async (event: MessageEvent) => {
    if (event.data?.type === "QUEUE_UPDATED") {
      try {
        const queue = await getAllQueueItems();
        callback(queue ?? []);
      } catch {
        callback([]);
      }
    }
  };
  channel.addEventListener("message", handler);
  return () => channel.removeEventListener("message", handler);
}

export async function migrateFromChromeStorage(): Promise<boolean> {
  try {
    const result = await chrome.storage.local.get("nano_flow_queue");
    const legacyQueue = result.nano_flow_queue as QueueItem[] | undefined;

    if (legacyQueue && legacyQueue.length > 0) {
      await setAllQueueItems(legacyQueue);
      await chrome.storage.local.remove("nano_flow_queue");
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (navigator.storage?.persist) {
      return await navigator.storage.persist();
    }
    return false;
  } catch {
    return false;
  }
}

export function closeBroadcastChannel(): void {
  if (broadcastChannel) {
    broadcastChannel.close();
    broadcastChannel = null;
  }
}

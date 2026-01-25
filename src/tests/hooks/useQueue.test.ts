import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import * as storageService from "@/backend/services/storageService";
import { QueueStatus, MessageType, GeminiTool } from "@/backend/types";
import { useQueue, constructFinalPrompt, createQueueItems } from "@/extension/hooks/useQueue";

import { mockChrome, clearMockStorage } from "../setup";

import type { QueueItem, AppSettings } from "@/backend/types";

const mockQueueItems: QueueItem[] = [
  {
    id: "item-1",
    originalPrompt: "Test prompt 1",
    finalPrompt: "Test prompt 1",
    status: QueueStatus.Pending,
  },
  {
    id: "item-2",
    originalPrompt: "Test prompt 2",
    finalPrompt: "Test prompt 2",
    status: QueueStatus.Completed,
  },
];

vi.mock("@/backend/services/storageService", () => ({
  getQueue: vi.fn().mockResolvedValue([]),
  setQueue: vi.fn().mockResolvedValue(undefined),
  onQueueChange: vi.fn().mockReturnValue(() => {}),
}));

describe("useQueue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockStorage();
    vi.mocked(storageService.getQueue).mockResolvedValue([]);
    vi.mocked(storageService.setQueue).mockResolvedValue(undefined);
    vi.mocked(storageService.onQueueChange).mockReturnValue(() => {});
  });

  describe("initialization", () => {
    it("should start with loading state", () => {
      const { result } = renderHook(() => useQueue());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.queue).toEqual([]);
    });

    it("should load queue from storage on mount", async () => {
      vi.mocked(storageService.getQueue).mockResolvedValue(mockQueueItems);

      const { result } = renderHook(() => useQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.queue).toEqual(mockQueueItems);
      expect(storageService.getQueue).toHaveBeenCalled();
    });

    it("should set isProcessing to true if any item is processing", async () => {
      const processingItems: QueueItem[] = [
        { ...mockQueueItems[0], status: QueueStatus.Processing },
        mockQueueItems[1],
      ];
      vi.mocked(storageService.getQueue).mockResolvedValue(processingItems);

      const { result } = renderHook(() => useQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isProcessing).toBe(true);
    });

    it("should set isProcessing to false if no items are processing", async () => {
      vi.mocked(storageService.getQueue).mockResolvedValue(mockQueueItems);

      const { result } = renderHook(() => useQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isProcessing).toBe(false);
    });

    it("should handle storage errors gracefully", async () => {
      vi.mocked(storageService.getQueue).mockRejectedValue(new Error("Storage error"));

      const { result } = renderHook(() => useQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.queue).toEqual([]);
    });
  });

  describe("addToQueue", () => {
    it("should add items to queue", async () => {
      vi.mocked(storageService.getQueue).mockResolvedValue([]);

      const { result } = renderHook(() => useQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newItems: QueueItem[] = [
        {
          id: "new-1",
          originalPrompt: "New prompt",
          finalPrompt: "New prompt",
          status: QueueStatus.Pending,
        },
      ];

      await act(async () => {
        await result.current.addToQueue(newItems);
      });

      expect(result.current.queue).toEqual(newItems);
      expect(storageService.setQueue).toHaveBeenCalledWith(newItems);
    });

    it("should append items to existing queue", async () => {
      vi.mocked(storageService.getQueue).mockResolvedValue(mockQueueItems);

      const { result } = renderHook(() => useQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newItems: QueueItem[] = [
        {
          id: "new-1",
          originalPrompt: "New prompt",
          finalPrompt: "New prompt",
          status: QueueStatus.Pending,
        },
      ];

      await act(async () => {
        await result.current.addToQueue(newItems);
      });

      expect(result.current.queue).toHaveLength(3);
      expect(storageService.setQueue).toHaveBeenCalledWith([...mockQueueItems, ...newItems]);
    });
  });

  describe("removeFromQueue", () => {
    it("should remove item by id", async () => {
      vi.mocked(storageService.getQueue).mockResolvedValue(mockQueueItems);

      const { result } = renderHook(() => useQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.removeFromQueue("item-1");
      });

      expect(result.current.queue).toHaveLength(1);
      expect(result.current.queue[0].id).toBe("item-2");
      expect(storageService.setQueue).toHaveBeenCalled();
    });

    it("should not modify queue if item not found", async () => {
      vi.mocked(storageService.getQueue).mockResolvedValue(mockQueueItems);

      const { result } = renderHook(() => useQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.removeFromQueue("non-existent-id");
      });

      expect(result.current.queue).toHaveLength(2);
    });
  });

  describe("clearCompleted", () => {
    it("should remove all completed items", async () => {
      vi.mocked(storageService.getQueue).mockResolvedValue(mockQueueItems);

      const { result } = renderHook(() => useQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.clearCompleted();
      });

      expect(result.current.queue).toHaveLength(1);
      expect(result.current.queue[0].status).toBe(QueueStatus.Pending);
    });

    it("should persist changes to storage", async () => {
      vi.mocked(storageService.getQueue).mockResolvedValue(mockQueueItems);

      const { result } = renderHook(() => useQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.clearCompleted();
      });

      expect(storageService.setQueue).toHaveBeenCalledWith([mockQueueItems[0]]);
    });
  });

  describe("clearAll", () => {
    it("should remove all items", async () => {
      vi.mocked(storageService.getQueue).mockResolvedValue(mockQueueItems);

      const { result } = renderHook(() => useQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.clearAll();
      });

      expect(result.current.queue).toEqual([]);
      expect(storageService.setQueue).toHaveBeenCalledWith([]);
    });
  });

  describe("processing controls", () => {
    it("should send PROCESS_QUEUE message on startProcessing", async () => {
      const { result } = renderHook(() => useQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.startProcessing();
      });

      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: MessageType.PROCESS_QUEUE,
      });
      expect(result.current.isProcessing).toBe(true);
    });

    it("should send STOP_PROCESSING message on stopProcessing", async () => {
      vi.mocked(storageService.getQueue).mockResolvedValue([
        { ...mockQueueItems[0], status: QueueStatus.Processing },
      ]);

      const { result } = renderHook(() => useQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.stopProcessing();
      });

      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: MessageType.STOP_PROCESSING,
      });
      expect(result.current.isProcessing).toBe(false);
    });

    it("should toggle processing state", async () => {
      const { result } = renderHook(() => useQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isProcessing).toBe(false);

      await act(async () => {
        await result.current.toggleProcessing();
      });

      expect(result.current.isProcessing).toBe(true);
      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: MessageType.PROCESS_QUEUE,
      });

      await act(async () => {
        await result.current.toggleProcessing();
      });

      expect(result.current.isProcessing).toBe(false);
      expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: MessageType.STOP_PROCESSING,
      });
    });
  });

  describe("queue change listener", () => {
    it("should subscribe to queue changes", async () => {
      renderHook(() => useQueue());

      await waitFor(() => {
        expect(storageService.onQueueChange).toHaveBeenCalled();
      });
    });

    it("should update queue when change event fires", async () => {
      let queueChangeCallback: ((queue: QueueItem[]) => void) | undefined;
      vi.mocked(storageService.onQueueChange).mockImplementation((cb) => {
        queueChangeCallback = cb;
        return () => {};
      });

      const { result } = renderHook(() => useQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updatedQueue: QueueItem[] = [
        {
          id: "updated-1",
          originalPrompt: "Updated",
          finalPrompt: "Updated",
          status: QueueStatus.Completed,
        },
      ];

      act(() => {
        queueChangeCallback?.(updatedQueue);
      });

      expect(result.current.queue).toEqual(updatedQueue);
    });

    it("should update isProcessing based on queue changes", async () => {
      let queueChangeCallback: ((queue: QueueItem[]) => void) | undefined;
      vi.mocked(storageService.onQueueChange).mockImplementation((cb) => {
        queueChangeCallback = cb;
        return () => {};
      });

      const { result } = renderHook(() => useQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isProcessing).toBe(false);

      act(() => {
        queueChangeCallback?.([
          {
            id: "processing-1",
            originalPrompt: "Test",
            finalPrompt: "Test",
            status: QueueStatus.Processing,
          },
        ]);
      });

      expect(result.current.isProcessing).toBe(true);
    });

    it("should cleanup listener on unmount", async () => {
      const cleanup = vi.fn();
      vi.mocked(storageService.onQueueChange).mockReturnValue(cleanup);

      const { unmount } = renderHook(() => useQueue());

      await waitFor(() => {
        expect(storageService.onQueueChange).toHaveBeenCalled();
      });

      unmount();

      expect(cleanup).toHaveBeenCalled();
    });
  });

  describe("message listener", () => {
    it("should respond to PROCESS_QUEUE message", async () => {
      const { result } = renderHook(() => useQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      const mockCalls = vi.mocked(mockChrome.runtime.onMessage.addListener).mock.calls;
      const messageListener = mockCalls[0][0] as (message: { type: MessageType }) => void;

      act(() => {
        messageListener({ type: MessageType.PROCESS_QUEUE });
      });

      expect(result.current.isProcessing).toBe(true);
    });

    it("should respond to STOP_PROCESSING message", async () => {
      vi.mocked(storageService.getQueue).mockResolvedValue([
        { ...mockQueueItems[0], status: QueueStatus.Processing },
      ]);

      const { result } = renderHook(() => useQueue());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isProcessing).toBe(true);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      const mockCalls = vi.mocked(mockChrome.runtime.onMessage.addListener).mock.calls;
      const messageListener = mockCalls[0][0] as (message: { type: MessageType }) => void;

      act(() => {
        messageListener({ type: MessageType.STOP_PROCESSING });
      });

      expect(result.current.isProcessing).toBe(false);
    });

    it("should remove message listener on unmount", () => {
      const { unmount } = renderHook(() => useQueue());

      unmount();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(vi.mocked(mockChrome.runtime.onMessage.removeListener)).toHaveBeenCalled();
    });
  });
});

describe("constructFinalPrompt", () => {
  const baseSettings: Pick<
    AppSettings,
    "prefix" | "suffix" | "globalNegatives" | "globalNegativesEnabled"
  > = {
    prefix: "",
    suffix: "",
    globalNegatives: "",
    globalNegativesEnabled: false,
  };

  it("should return original prompt when no prefix or suffix", () => {
    const result = constructFinalPrompt("Test prompt", baseSettings);
    expect(result).toBe("Test prompt");
  });

  it("should add prefix to prompt", () => {
    const result = constructFinalPrompt("Test prompt", { ...baseSettings, prefix: "PREFIX:" });
    expect(result).toBe("PREFIX: Test prompt");
  });

  it("should add suffix to prompt", () => {
    const result = constructFinalPrompt("Test prompt", { ...baseSettings, suffix: "SUFFIX" });
    expect(result).toBe("Test prompt SUFFIX");
  });

  it("should add both prefix and suffix", () => {
    const result = constructFinalPrompt("Test prompt", {
      ...baseSettings,
      prefix: "START",
      suffix: "END",
    });
    expect(result).toBe("START Test prompt END");
  });

  it("should add global negatives when enabled", () => {
    const result = constructFinalPrompt("Test prompt", {
      ...baseSettings,
      globalNegatives: "blurry, watermark",
      globalNegativesEnabled: true,
    });
    expect(result).toBe("Test prompt. NOT blurry, watermark");
  });

  it("should not add global negatives when disabled", () => {
    const result = constructFinalPrompt("Test prompt", {
      ...baseSettings,
      globalNegatives: "blurry, watermark",
      globalNegativesEnabled: false,
    });
    expect(result).toBe("Test prompt");
  });

  it("should not add empty global negatives", () => {
    const result = constructFinalPrompt("Test prompt", {
      ...baseSettings,
      globalNegatives: "   ",
      globalNegativesEnabled: true,
    });
    expect(result).toBe("Test prompt");
  });

  it("should combine all options", () => {
    const result = constructFinalPrompt("Test prompt", {
      prefix: "PREFIX",
      suffix: "SUFFIX",
      globalNegatives: "bad quality",
      globalNegativesEnabled: true,
    });
    expect(result).toBe("PREFIX Test prompt SUFFIX. NOT bad quality");
  });
});

describe("createQueueItems", () => {
  const baseSettings: Pick<
    AppSettings,
    "prefix" | "suffix" | "globalNegatives" | "globalNegativesEnabled" | "globalVariables"
  > = {
    prefix: "",
    suffix: "",
    globalNegatives: "",
    globalNegativesEnabled: false,
    globalVariables: [],
  };

  it("should create queue items from prompts", () => {
    const items = createQueueItems(["Prompt 1", "Prompt 2"], baseSettings);

    expect(items).toHaveLength(2);
    expect(items[0].originalPrompt).toBe("Prompt 1");
    expect(items[0].finalPrompt).toBe("Prompt 1");
    expect(items[0].status).toBe(QueueStatus.Pending);
    expect(items[1].originalPrompt).toBe("Prompt 2");
  });

  it("should generate unique IDs", () => {
    const items = createQueueItems(["Prompt 1", "Prompt 2"], baseSettings);

    expect(items[0].id).toBeTruthy();
    expect(items[1].id).toBeTruthy();
    expect(items[0].id).not.toBe(items[1].id);
  });

  it("should apply prefix and suffix to final prompt", () => {
    const items = createQueueItems(["Test"], {
      ...baseSettings,
      prefix: "PREFIX",
      suffix: "SUFFIX",
    });

    expect(items[0].originalPrompt).toBe("Test");
    expect(items[0].finalPrompt).toBe("PREFIX Test SUFFIX");
  });

  it("should include images when provided", () => {
    const images = ["data:image/png;base64,abc123", "data:image/png;base64,def456"];
    const items = createQueueItems(["Test"], baseSettings, images);

    expect(items[0].images).toEqual(images);
  });

  it("should not include images property when empty array provided", () => {
    const items = createQueueItems(["Test"], baseSettings, []);

    expect(items[0].images).toBeUndefined();
  });

  it("should include tool when provided", () => {
    const items = createQueueItems(["Test"], baseSettings, undefined, GeminiTool.IMAGE);

    expect(items[0].tool).toBe(GeminiTool.IMAGE);
  });

  it("should expand variables in prompts", () => {
    const settingsWithVariables = {
      ...baseSettings,
      globalVariables: [
        {
          id: "var-1",
          name: "Variable Set",
          variables: [
            {
              name: "color",
              values: ["red", "blue"],
            },
          ],
        },
      ],
    };

    const items = createQueueItems(["A {color} car"], settingsWithVariables);

    expect(items).toHaveLength(2);
    expect(items[0].originalPrompt).toBe("A red car");
    expect(items[1].originalPrompt).toBe("A blue car");
  });

  it("should expand multiple variables", () => {
    const settingsWithVariables = {
      ...baseSettings,
      globalVariables: [
        {
          id: "var-1",
          name: "Variable Set",
          variables: [
            {
              name: "size",
              values: ["small", "large"],
            },
            {
              name: "color",
              values: ["red", "blue"],
            },
          ],
        },
      ],
    };

    const items = createQueueItems(["A {size} {color} box"], settingsWithVariables);

    expect(items).toHaveLength(4);
    expect(items.map((i) => i.originalPrompt)).toContain("A small red box");
    expect(items.map((i) => i.originalPrompt)).toContain("A small blue box");
    expect(items.map((i) => i.originalPrompt)).toContain("A large red box");
    expect(items.map((i) => i.originalPrompt)).toContain("A large blue box");
  });
});

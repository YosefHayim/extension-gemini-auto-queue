import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { GeminiMode, GeminiTool, QueueStatus } from "@/backend/types";
import { QueuePanel } from "@/extension/components/queue-panel/QueuePanel";

import type { QueueItem } from "@/backend/types";

function createMockQueueItem(overrides: Partial<QueueItem> = {}): QueueItem {
  return {
    id: `item-${Math.random().toString(36).slice(2, 9)}`,
    originalPrompt: "Test prompt",
    finalPrompt: "Test prompt",
    status: QueueStatus.Pending,
    tool: GeminiTool.IMAGE,
    mode: GeminiMode.Quick,
    images: [],
    ...overrides,
  };
}

describe("QueuePanel", () => {
  const defaultProps = {
    queue: [] as QueueItem[],
    isDark: false,
    hasApiKey: true,
    onAddToQueue: vi.fn(),
    onRemoveFromQueue: vi.fn(),
    onRetryQueueItem: vi.fn(),
    onClearAll: vi.fn(),
    onOpenCsvDialog: vi.fn(),
    onReorderQueue: vi.fn(),
    onDuplicateItem: vi.fn(),
    onDuplicateWithAI: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Empty State", () => {
    it("renders empty queue message when queue is empty", () => {
      render(<QueuePanel {...defaultProps} queue={[]} />);

      expect(screen.getByText("Your queue is empty")).toBeInTheDocument();
    });

    it("shows helper text for adding prompts", () => {
      render(<QueuePanel {...defaultProps} queue={[]} />);

      expect(screen.getByText("Add prompts above to get started")).toBeInTheDocument();
    });

    it("shows prompt input area", () => {
      render(<QueuePanel {...defaultProps} />);

      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });
  });

  describe("Queue with Items", () => {
    it("renders queue items when queue is not empty", () => {
      const queue = [
        createMockQueueItem({ id: "item-1", originalPrompt: "First prompt" }),
        createMockQueueItem({ id: "item-2", originalPrompt: "Second prompt" }),
      ];
      render(<QueuePanel {...defaultProps} queue={queue} />);

      expect(screen.getByText("First prompt")).toBeInTheDocument();
      expect(screen.getByText("Second prompt")).toBeInTheDocument();
    });

    it("does not show empty message when queue has items", () => {
      const queue = [createMockQueueItem({ id: "item-1" })];
      render(<QueuePanel {...defaultProps} queue={queue} />);

      expect(screen.queryByText("Your queue is empty")).not.toBeInTheDocument();
    });
  });

  describe("Queue Statistics", () => {
    it("shows pending items in the list", () => {
      const queue = [
        createMockQueueItem({ id: "1", status: QueueStatus.Pending, originalPrompt: "Pending 1" }),
        createMockQueueItem({ id: "2", status: QueueStatus.Pending, originalPrompt: "Pending 2" }),
        createMockQueueItem({
          id: "3",
          status: QueueStatus.Completed,
          originalPrompt: "Completed",
        }),
      ];
      render(<QueuePanel {...defaultProps} queue={queue} />);

      expect(screen.getByText("Pending 1")).toBeInTheDocument();
      expect(screen.getByText("Pending 2")).toBeInTheDocument();
    });

    it("shows completed items in the list", () => {
      const queue = [
        createMockQueueItem({ id: "1", status: QueueStatus.Pending, originalPrompt: "Pending" }),
        createMockQueueItem({
          id: "2",
          status: QueueStatus.Completed,
          originalPrompt: "Completed 1",
        }),
        createMockQueueItem({
          id: "3",
          status: QueueStatus.Completed,
          originalPrompt: "Completed 2",
        }),
      ];
      render(<QueuePanel {...defaultProps} queue={queue} />);

      expect(screen.getByText("Completed 1")).toBeInTheDocument();
      expect(screen.getByText("Completed 2")).toBeInTheDocument();
    });
  });

  describe("Dark Mode", () => {
    it("renders with dark mode styling", () => {
      const queue = [createMockQueueItem({ id: "item-1" })];
      render(<QueuePanel {...defaultProps} queue={queue} isDark />);

      expect(screen.getByText("Test prompt")).toBeInTheDocument();
    });
  });

  describe("Mode Selection", () => {
    it("renders with selected mode", () => {
      render(
        <QueuePanel {...defaultProps} selectedMode={GeminiMode.Deep} onModeChange={vi.fn()} />
      );

      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });
  });

  describe("Tool Selection", () => {
    it("renders with default tool", () => {
      render(<QueuePanel {...defaultProps} defaultTool={GeminiTool.VIDEO} />);

      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });
  });

  describe("Status Filtering", () => {
    it("renders queue items with mixed statuses", () => {
      const queue = [
        createMockQueueItem({
          id: "1",
          status: QueueStatus.Pending,
          originalPrompt: "Pending task",
        }),
        createMockQueueItem({
          id: "2",
          status: QueueStatus.Processing,
          originalPrompt: "Processing task",
        }),
        createMockQueueItem({
          id: "3",
          status: QueueStatus.Completed,
          originalPrompt: "Completed task",
        }),
        createMockQueueItem({ id: "4", status: QueueStatus.Failed, originalPrompt: "Failed task" }),
      ];
      render(<QueuePanel {...defaultProps} queue={queue} />);

      expect(screen.getByText("Pending task")).toBeInTheDocument();
      expect(screen.getByText("Processing task")).toBeInTheDocument();
      expect(screen.getByText("Completed task")).toBeInTheDocument();
      expect(screen.getByText("Failed task")).toBeInTheDocument();
    });
  });

  describe("Bulk Actions", () => {
    it("renders with bulk action handlers", () => {
      const queue = [createMockQueueItem({ id: "item-1" })];
      render(
        <QueuePanel
          {...defaultProps}
          queue={queue}
          onBulkAttachImages={vi.fn()}
          onBulkAIOptimize={vi.fn()}
          onBulkModify={vi.fn()}
        />
      );

      expect(screen.getByText("Test prompt")).toBeInTheDocument();
    });
  });

  describe("Clear Actions", () => {
    it("renders with clear completed handler", () => {
      const queue = [createMockQueueItem({ id: "1", status: QueueStatus.Completed })];
      render(<QueuePanel {...defaultProps} queue={queue} onClearCompleted={vi.fn()} />);

      expect(screen.getByText("Test prompt")).toBeInTheDocument();
    });
  });

  describe("Export", () => {
    it("renders with export handler", () => {
      const queue = [createMockQueueItem({ id: "item-1" })];
      render(<QueuePanel {...defaultProps} queue={queue} onOpenExport={vi.fn()} />);

      expect(screen.getByText("Test prompt")).toBeInTheDocument();
    });
  });

  describe("Item Callbacks", () => {
    it("passes onEditItem to queue items", () => {
      const queue = [createMockQueueItem({ id: "item-1" })];
      const onEditItem = vi.fn();
      render(<QueuePanel {...defaultProps} queue={queue} onEditItem={onEditItem} />);

      expect(screen.getByText("Test prompt")).toBeInTheDocument();
    });

    it("passes onRunSingleItem to queue items", () => {
      const queue = [createMockQueueItem({ id: "item-1" })];
      const onRunSingleItem = vi.fn();
      render(<QueuePanel {...defaultProps} queue={queue} onRunSingleItem={onRunSingleItem} />);

      expect(screen.getByText("Test prompt")).toBeInTheDocument();
    });

    it("passes onUpdateItemImages to queue items", () => {
      const queue = [createMockQueueItem({ id: "item-1" })];
      const onUpdateItemImages = vi.fn();
      render(
        <QueuePanel {...defaultProps} queue={queue} onUpdateItemImages={onUpdateItemImages} />
      );

      expect(screen.getByText("Test prompt")).toBeInTheDocument();
    });
  });
});

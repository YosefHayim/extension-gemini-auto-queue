import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { GeminiMode, GeminiTool, QueueStatus } from "@/backend/types";
import { QueueItemCard } from "@/extension/components/queue-item-card/QueueItemCard";

import type { QueueItem } from "@/backend/types";

function createMockQueueItem(overrides: Partial<QueueItem> = {}): QueueItem {
  return {
    id: "test-item-1",
    originalPrompt: "Test prompt for the queue item",
    finalPrompt: "Test prompt for the queue item",
    status: QueueStatus.Pending,
    tool: GeminiTool.IMAGE,
    mode: GeminiMode.Quick,
    images: [],
    ...overrides,
  };
}

describe("QueueItemCard", () => {
  const defaultProps = {
    item: createMockQueueItem(),
    isDark: false,
    queueNumber: 1,
    onRemove: vi.fn(),
    onRetry: vi.fn(),
    onDuplicate: vi.fn(),
    onDuplicateWithAI: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders the queue item card", () => {
      render(<QueueItemCard {...defaultProps} />);

      expect(screen.getByText("Test prompt for the queue item")).toBeInTheDocument();
    });

    it("displays the queue number with hash prefix", () => {
      render(<QueueItemCard {...defaultProps} queueNumber={5} />);

      expect(screen.getByText("#5")).toBeInTheDocument();
    });

    it("renders with dark mode styling", () => {
      render(<QueueItemCard {...defaultProps} isDark />);

      expect(screen.getByText("Test prompt for the queue item")).toBeInTheDocument();
    });

    it("renders pending status correctly", () => {
      render(<QueueItemCard {...defaultProps} />);

      expect(screen.getByText("Test prompt for the queue item")).toBeInTheDocument();
    });

    it("renders completed status correctly", () => {
      const item = createMockQueueItem({ status: QueueStatus.Completed });
      render(<QueueItemCard {...defaultProps} item={item} />);

      expect(screen.getByText("Test prompt for the queue item")).toBeInTheDocument();
    });

    it("renders processing status correctly", () => {
      const item = createMockQueueItem({ status: QueueStatus.Processing });
      render(<QueueItemCard {...defaultProps} item={item} />);

      expect(screen.getByText("Test prompt for the queue item")).toBeInTheDocument();
    });

    it("renders failed status correctly", () => {
      const item = createMockQueueItem({
        status: QueueStatus.Failed,
        error: "Something went wrong",
      });
      render(<QueueItemCard {...defaultProps} item={item} />);

      expect(screen.getByText("Test prompt for the queue item")).toBeInTheDocument();
    });
  });

  describe("Action Buttons", () => {
    it("calls onRemove when remove button is clicked", () => {
      render(<QueueItemCard {...defaultProps} />);

      const removeButton = screen.getByTitle("Remove from queue");
      fireEvent.click(removeButton);

      expect(defaultProps.onRemove).toHaveBeenCalledWith("test-item-1");
    });

    it("calls onRetry when retry button is clicked for failed items", () => {
      const item = createMockQueueItem({ status: QueueStatus.Failed });
      render(<QueueItemCard {...defaultProps} item={item} />);

      const retryButton = screen.getByTitle("Retry this prompt");
      fireEvent.click(retryButton);

      expect(defaultProps.onRetry).toHaveBeenCalledWith("test-item-1");
    });

    it("calls onDuplicate when duplicate button is clicked", () => {
      render(<QueueItemCard {...defaultProps} />);

      const duplicateButton = screen.getByTitle("Duplicate this prompt");
      fireEvent.click(duplicateButton);

      expect(defaultProps.onDuplicate).toHaveBeenCalledWith("test-item-1");
    });

    it("calls onDuplicateWithAI when AI duplicate button is clicked", () => {
      render(<QueueItemCard {...defaultProps} />);

      const aiDuplicateButton = screen.getByTitle("Duplicate and enhance with AI");
      fireEvent.click(aiDuplicateButton);

      expect(defaultProps.onDuplicateWithAI).toHaveBeenCalledWith("test-item-1");
    });
  });

  describe("Edit Mode", () => {
    it("shows edit button for pending items with onEdit prop", () => {
      const onEdit = vi.fn();
      render(<QueueItemCard {...defaultProps} onEdit={onEdit} />);

      expect(screen.getByTitle("Edit prompt")).toBeInTheDocument();
    });

    it("does not show edit button for non-pending items", () => {
      const item = createMockQueueItem({ status: QueueStatus.Completed });
      const onEdit = vi.fn();
      render(<QueueItemCard {...defaultProps} item={item} onEdit={onEdit} />);

      expect(screen.queryByTitle("Edit prompt")).not.toBeInTheDocument();
    });

    it("opens edit dialog when edit button is clicked", () => {
      const onEdit = vi.fn();
      render(<QueueItemCard {...defaultProps} onEdit={onEdit} />);

      const editButton = screen.getByTitle("Edit prompt");
      fireEvent.click(editButton);

      // Dialog should open with textarea
      expect(screen.getByRole("textbox")).toBeInTheDocument();
      expect(screen.getByText("Edit Prompt")).toBeInTheDocument();
    });

    it("calls onEdit with updated prompt when saved from dialog", () => {
      const onEdit = vi.fn();
      render(<QueueItemCard {...defaultProps} onEdit={onEdit} />);

      // Open dialog
      const editButton = screen.getByTitle("Edit prompt");
      fireEvent.click(editButton);

      // Edit and save
      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "Updated prompt" } });
      const saveButton = screen.getByText("Save");
      fireEvent.click(saveButton);

      expect(onEdit).toHaveBeenCalledWith("test-item-1", {
        prompt: "Updated prompt",
        mode: GeminiMode.Quick,
        tool: GeminiTool.IMAGE,
      });
    });

    it("closes dialog without saving when Cancel is clicked", () => {
      const onEdit = vi.fn();
      render(<QueueItemCard {...defaultProps} onEdit={onEdit} />);

      // Open dialog
      const editButton = screen.getByTitle("Edit prompt");
      fireEvent.click(editButton);

      // Click cancel
      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);

      expect(onEdit).not.toHaveBeenCalled();
      expect(screen.queryByText("Edit Prompt")).not.toBeInTheDocument();
    });
  });

  describe("Selection", () => {
    it("renders selection button when showCheckbox is true", () => {
      const onToggleSelect = vi.fn();
      render(<QueueItemCard {...defaultProps} showCheckbox onToggleSelect={onToggleSelect} />);

      const buttons = screen.getAllByRole("button");
      const selectionButton = buttons.find(
        (btn) => btn.className.includes("h-4") && btn.className.includes("w-4")
      );
      expect(selectionButton).toBeDefined();
    });

    it("renders selection button when isSelected is true", () => {
      const onToggleSelect = vi.fn();
      render(<QueueItemCard {...defaultProps} isSelected onToggleSelect={onToggleSelect} />);

      const buttons = screen.getAllByRole("button");
      const selectionButton = buttons.find(
        (btn) => btn.className.includes("h-4") && btn.className.includes("w-4")
      );
      expect(selectionButton).toBeDefined();
    });

    it("selection button has primary styling when isSelected is true", () => {
      const onToggleSelect = vi.fn();
      render(
        <QueueItemCard {...defaultProps} showCheckbox isSelected onToggleSelect={onToggleSelect} />
      );

      const buttons = screen.getAllByRole("button");
      const selectionButton = buttons.find(
        (btn) =>
          btn.className.includes("h-4") &&
          btn.className.includes("w-4") &&
          btn.className.includes("bg-primary")
      );
      expect(selectionButton).toBeDefined();
    });

    it("calls onToggleSelect when selection button is clicked", () => {
      const onToggleSelect = vi.fn();
      render(<QueueItemCard {...defaultProps} showCheckbox onToggleSelect={onToggleSelect} />);

      const buttons = screen.getAllByRole("button");
      const selectionButton = buttons.find(
        (btn) => btn.className.includes("h-4") && btn.className.includes("w-4")
      );
      expect(selectionButton).toBeDefined();
      if (selectionButton) {
        fireEvent.click(selectionButton);
      }

      expect(onToggleSelect).toHaveBeenCalledWith("test-item-1");
    });

    it("does not render selection button when showCheckbox is false and not selected", () => {
      render(<QueueItemCard {...defaultProps} showCheckbox={false} isSelected={false} />);

      const buttons = screen.getAllByRole("button");
      const selectionButton = buttons.find(
        (btn) => btn.className.includes("h-4") && btn.className.includes("w-4")
      );
      expect(selectionButton).toBeUndefined();
    });
  });

  describe("Images", () => {
    it("renders image thumbnails when item has images", () => {
      const item = createMockQueueItem({
        images: ["data:image/png;base64,abc123", "data:image/png;base64,def456"],
      });
      render(<QueueItemCard {...defaultProps} item={item} />);

      const images = screen.getAllByRole("img");
      expect(images.length).toBeGreaterThan(0);
    });

    it("does not render image section when item has no images", () => {
      const item = createMockQueueItem({ images: [] });
      render(<QueueItemCard {...defaultProps} item={item} />);

      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });
  });

  describe("Search Highlighting", () => {
    it("passes searchText to prompt display for highlighting", () => {
      render(<QueueItemCard {...defaultProps} searchText="prompt" />);

      expect(screen.getByText(/prompt/i)).toBeInTheDocument();
    });
  });

  describe("Run Single Item", () => {
    it("calls onRunSingle when run button is clicked for pending items", () => {
      const onRunSingle = vi.fn();
      render(<QueueItemCard {...defaultProps} onRunSingle={onRunSingle} />);

      const runButton = screen.getByTitle("Run this prompt now");
      fireEvent.click(runButton);

      expect(onRunSingle).toHaveBeenCalledWith("test-item-1");
    });
  });

  describe("Drag Handle", () => {
    it("renders drag handle", () => {
      render(<QueueItemCard {...defaultProps} />);

      expect(screen.getByTitle("Drag to reorder")).toBeInTheDocument();
    });

    it("applies dragHandleProps to drag handle element", () => {
      const dragHandleProps = {
        "data-testid": "drag-handle",
        onMouseDown: vi.fn(),
      };
      render(<QueueItemCard {...defaultProps} dragHandleProps={dragHandleProps} />);

      expect(screen.getByTestId("drag-handle")).toBeInTheDocument();
    });
  });
});

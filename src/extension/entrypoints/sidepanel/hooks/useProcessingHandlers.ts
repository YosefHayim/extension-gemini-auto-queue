import { useCallback } from "react";
import { toast } from "sonner";

import { MessageType } from "@/backend/types";

import type { SendMessageFn } from "@/extension/entrypoints/sidepanel/types";

interface UseProcessingHandlersProps {
  isProcessing: boolean;
  isPaused: boolean;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
  sendMessage: SendMessageFn;
}

export function useProcessingHandlers({
  isProcessing,
  isPaused,
  setIsProcessing,
  setIsPaused,
  sendMessage,
}: UseProcessingHandlersProps) {
  const toggleProcessing = useCallback(async () => {
    if (isProcessing) {
      await sendMessage({ type: MessageType.PAUSE_PROCESSING });
      setIsProcessing(false);
      setIsPaused(true);
      toast.info("Processing paused");
    } else {
      await sendMessage({ type: MessageType.PROCESS_QUEUE });
      setIsProcessing(true);
      setIsPaused(false);
      toast.success(isPaused ? "Processing resumed" : "Processing started");
    }
  }, [isProcessing, isPaused, setIsProcessing, setIsPaused, sendMessage]);

  return {
    toggleProcessing,
  };
}

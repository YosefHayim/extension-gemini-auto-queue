import { useCallback } from "react";
import { toast } from "sonner";

import { MessageType } from "@/backend/types";

import type { SendMessageFn } from "../types";
import type { ChatMediaCounts } from "@/extension/components/BulkActionsDialog";

interface UseChatMediaHandlersProps {
  sendMessage: SendMessageFn;
}

export function useChatMediaHandlers({ sendMessage }: UseChatMediaHandlersProps) {
  const handleScanChatMedia = useCallback(async (): Promise<ChatMediaCounts | null> => {
    try {
      const response = await sendMessage<{ items: unknown[]; counts: ChatMediaCounts }>({
        type: MessageType.SCAN_CHAT_MEDIA,
      });
      if (response.success && response.data?.counts) {
        return response.data.counts;
      }
      return null;
    } catch {
      toast.error("Failed to scan chat for media");
      return null;
    }
  }, [sendMessage]);

  const handleDownloadChatMedia = useCallback(
    async (method: "native" | "direct", filterType?: "image" | "video" | "file") => {
      toast.info("Starting download...");
      try {
        const response = await sendMessage<{
          downloadCount?: number;
          success?: number;
          failed?: number;
        }>({
          type: MessageType.DOWNLOAD_CHAT_MEDIA,
          payload: { method, filterType },
        });
        if (response.success) {
          if (method === "native") {
            toast.success(`Started ${response.data?.downloadCount ?? 0} downloads via Gemini`);
          } else {
            const successCount = response.data?.success ?? 0;
            const failedCount = response.data?.failed ?? 0;
            toast.success(
              `Downloaded ${successCount} file${successCount !== 1 ? "s" : ""}${failedCount > 0 ? ` (${failedCount} failed)` : ""}`
            );
          }
        } else {
          toast.error(response.error ?? "Download failed");
        }
      } catch {
        toast.error("Failed to download media");
      }
    },
    [sendMessage]
  );

  return {
    handleScanChatMedia,
    handleDownloadChatMedia,
  };
}

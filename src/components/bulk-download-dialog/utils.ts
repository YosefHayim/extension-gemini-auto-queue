import { QueueStatus } from "@/types";

import type { QueueItem } from "@/types";
import type { DownloadableFile } from "@/types/imageProcessing";

export function collectDownloadableFiles(queue: QueueItem[]): DownloadableFile[] {
  const files: DownloadableFile[] = [];

  queue
    .filter((item) => item.status === QueueStatus.Completed)
    .forEach((item) => {
      const flashUrl = item.results?.flash?.url;
      const proUrl = item.results?.pro?.url;
      const promptPreview =
        item.originalPrompt.length > 30
          ? `${item.originalPrompt.substring(0, 30)}...`
          : item.originalPrompt;

      if (flashUrl) {
        files.push({
          id: `${item.id}-flash`,
          queueItemId: item.id,
          promptPreview,
          url: flashUrl,
          type: "image",
          filename: `gemini_${item.id}_flash`,
          selected: true,
          thumbnail: flashUrl,
        });
      }

      if (proUrl && proUrl !== flashUrl) {
        files.push({
          id: `${item.id}-pro`,
          queueItemId: item.id,
          promptPreview,
          url: proUrl,
          type: "image",
          filename: `gemini_${item.id}_pro`,
          selected: true,
          thumbnail: proUrl,
        });
      }
    });

  return files;
}

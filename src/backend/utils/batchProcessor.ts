import { buildGoogleImageUrl, canUseServerSideProcessing } from "@/backend/utils/googleImageUrl";
import { FORMAT_INFO } from "@/backend/utils/imagePresets";
import { downloadBlob, processWithCanvas } from "@/backend/utils/imageProcessor";

import type {
  BatchProgress,
  BatchResult,
  DownloadableFile,
  ProcessingOptions,
  ProcessingResult,
} from "@/backend/types/imageProcessing";

export interface BatchOptions {
  concurrency?: number;
  delayBetween?: number;
  onProgress?: (progress: BatchProgress) => void;
  onItemComplete?: (result: ProcessingResult) => void;
}

function generateFilename(originalFilename: string, format: string, index: number): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const baseName = originalFilename.replace(/\.[^.]+$/, "") || `image_${index}`;
  return `${baseName}_${timestamp}.${format}`;
}

function estimateTimeRemaining(startTime: number, completed: number, total: number): number {
  if (completed === 0) return 0;
  const elapsed = Date.now() - startTime;
  const avgTimePerItem = elapsed / completed;
  const remaining = total - completed;
  return Math.round(avgTimePerItem * remaining);
}

async function processAndDownload(
  item: DownloadableFile,
  options: ProcessingOptions,
  index: number
): Promise<ProcessingResult> {
  const startTime = Date.now();
  const formatInfo = FORMAT_INFO[options.format];
  const filename = generateFilename(item.filename, formatInfo.extension, index);

  try {
    const useServer = canUseServerSideProcessing(item.url, options);

    if (useServer) {
      const processedUrl = buildGoogleImageUrl(item.url, options);
      const response = await fetch(processedUrl, { mode: "cors" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const blob = await response.blob();
      downloadBlob(blob, filename);

      return {
        success: true,
        originalUrl: item.url,
        processedUrl,
        filename,
        processingTime: Date.now() - startTime,
        strategy: "server",
      };
    }

    const blob = await processWithCanvas(item.url, options);
    downloadBlob(blob, filename);

    return {
      success: true,
      originalUrl: item.url,
      filename,
      processingTime: Date.now() - startTime,
      strategy: "client",
    };
  } catch (error) {
    return {
      success: false,
      originalUrl: item.url,
      filename,
      error: error instanceof Error ? error.message : "Unknown error",
      processingTime: Date.now() - startTime,
      strategy: canUseServerSideProcessing(item.url, options) ? "server" : "client",
    };
  }
}

export async function processBatch(
  items: DownloadableFile[],
  processingOptions: ProcessingOptions,
  batchOptions: BatchOptions = {}
): Promise<BatchResult> {
  const { concurrency = 3, delayBetween = 200, onProgress, onItemComplete } = batchOptions;

  const results: ProcessingResult[] = [];
  const startTime = Date.now();

  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);

    const chunkResults = await Promise.allSettled(
      chunk.map((item, chunkIndex) => processAndDownload(item, processingOptions, i + chunkIndex))
    );

    for (let j = 0; j < chunkResults.length; j++) {
      const result = chunkResults[j];
      const item = chunk[j];

      if (result.status === "fulfilled") {
        results.push(result.value);
        onItemComplete?.(result.value);
      } else {
        const reason = result.reason as Error | undefined;
        const failedResult: ProcessingResult = {
          success: false,
          originalUrl: item.url,
          filename: item.filename || "unknown",
          error: reason?.message ?? "Processing failed",
          processingTime: 0,
          strategy: "client",
        };
        results.push(failedResult);
        onItemComplete?.(failedResult);
      }

      onProgress?.({
        completed: results.length,
        total: items.length,
        currentItem: item.filename || "Processing...",
        estimatedTimeRemaining: estimateTimeRemaining(startTime, results.length, items.length),
      });
    }

    if (i + concurrency < items.length) {
      await new Promise((r) => setTimeout(r, delayBetween));
    }
  }

  return {
    results,
    successCount: results.filter((r) => r.success).length,
    failedCount: results.filter((r) => !r.success).length,
    totalTime: Date.now() - startTime,
  };
}

export async function downloadSingleFile(
  item: DownloadableFile,
  options: ProcessingOptions
): Promise<ProcessingResult> {
  return processAndDownload(item, options, 0);
}

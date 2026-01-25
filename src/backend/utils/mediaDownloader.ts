/**
 * Media Downloader Utilities
 * Handles extraction and bulk downloading of media from Gemini chat responses
 */

export interface MediaItem {
  type: "image" | "video" | "file";
  url: string;
  filename?: string;
  thumbnail?: string;
  mimeType?: string;
}

/**
 * Find all generated images in the current Gemini chat
 */
export function findGeneratedImages(): MediaItem[] {
  const images: MediaItem[] = [];
  const seen = new Set<string>();

  // Selector patterns for generated images in Gemini
  const imageSelectors = [
    // Generated image containers
    "generated-image img",
    "image-preview img",
    ".generated-image img",
    ".generated-image-container img",
    // Response container images (excluding avatars and icons)
    "response-element img:not([src*='avatar']):not([class*='icon']):not([width='24']):not([height='24'])",
    "model-response img:not([src*='avatar']):not([class*='icon'])",
    ".response-container img:not([src*='avatar']):not([class*='icon']):not([src*='boq-bard-ui'])",
    // Blob URLs (generated content)
    'img[src^="blob:"]',
    // Data URLs (inline images)
    'img[src^="data:image"]',
    // Google storage images (generated)
    'img[src*="lh3.googleusercontent.com"]',
    'img[src*="googleusercontent.com/img"]',
  ];

  for (const selector of imageSelectors) {
    try {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        const img = el as HTMLImageElement;

        // Skip small images (icons, thumbnails)
        if (img.naturalWidth < 100 || img.naturalHeight < 100) continue;
        if (img.width < 100 || img.height < 100) continue;

        // Skip avatar images
        if (img.className.includes("avatar") || img.alt.toLowerCase().includes("avatar")) continue;

        // Get the best quality URL
        let url = img.src;

        // Check for data-src or srcset for higher resolution
        const dataSrc = img.getAttribute("data-src");
        if (dataSrc && !dataSrc.startsWith("data:")) {
          url = dataSrc;
        }

        // Check srcset for highest resolution
        const srcset = img.srcset;
        if (srcset) {
          const sources = srcset.split(",").map((s) => s.trim());
          const highRes = sources[sources.length - 1]?.split(" ")[0];
          if (highRes) url = highRes;
        }

        if (!url || seen.has(url)) continue;
        seen.add(url);

        images.push({
          type: "image",
          url,
          filename: generateFilename("image", images.length + 1, getExtensionFromUrl(url)),
          thumbnail: img.src,
        });
      }
    } catch {
      // Selector failed, continue
    }
  }

  return images;
}

/**
 * Find all generated videos in the current Gemini chat
 */
export function findGeneratedVideos(): MediaItem[] {
  const videos: MediaItem[] = [];
  const seen = new Set<string>();

  // Selector patterns for videos
  const videoSelectors = [
    "video[src]",
    "video source[src]",
    ".video-container video",
    "response-element video",
    'iframe[src*="video"]',
    'iframe[src*="youtube"]',
    // Veo generated videos
    "veo-video-player video",
    ".veo-video video",
  ];

  for (const selector of videoSelectors) {
    try {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        let url = "";

        if (el.tagName === "VIDEO") {
          const video = el as HTMLVideoElement;
          url = video.src || video.currentSrc;

          // Check source elements
          if (!url) {
            const source = video.querySelector("source");
            url = source?.src ?? "";
          }
        } else if (el.tagName === "SOURCE") {
          url = (el as HTMLSourceElement).src;
        } else if (el.tagName === "IFRAME") {
          url = (el as HTMLIFrameElement).src;
        }

        if (!url || seen.has(url)) continue;
        seen.add(url);

        videos.push({
          type: "video",
          url,
          filename: generateFilename("video", videos.length + 1, getExtensionFromUrl(url) || "mp4"),
          mimeType: getMimeType(url),
        });
      }
    } catch {
      // Selector failed, continue
    }
  }

  return videos;
}

/**
 * Find all downloadable files (PDFs, docs, etc.)
 */
export function findDownloadableFiles(): MediaItem[] {
  const files: MediaItem[] = [];
  const seen = new Set<string>();

  // Look for download links
  const linkSelectors = [
    "a[download]",
    'a[href$=".pdf"]',
    'a[href$=".doc"]',
    'a[href$=".docx"]',
    'a[href$=".xlsx"]',
    'a[href$=".csv"]',
    "download-button a",
    ".download-link",
  ];

  for (const selector of linkSelectors) {
    try {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        const link = el as HTMLAnchorElement;
        const url = link.href;

        if (!url || seen.has(url)) continue;
        seen.add(url);

        files.push({
          type: "file",
          url,
          filename: (link.download || extractFilenameFromUrl(url)) ?? `file_${files.length + 1}`,
          mimeType: getMimeType(url),
        });
      }
    } catch {
      // Selector failed, continue
    }
  }

  return files;
}

/**
 * Find all media in the current chat
 */
export function findAllMedia(): MediaItem[] {
  return [...findGeneratedImages(), ...findGeneratedVideos(), ...findDownloadableFiles()];
}

/**
 * Download a single media item
 */
export async function downloadMedia(item: MediaItem): Promise<boolean> {
  try {
    // For blob URLs and data URLs, we can download directly
    if (item.url.startsWith("blob:") || item.url.startsWith("data:")) {
      const response = await fetch(item.url);
      const blob = await response.blob();
      downloadBlob(blob, item.filename ?? "download");
      return true;
    }

    // For external URLs, try fetch first
    try {
      const response = await fetch(item.url, { mode: "cors" });
      if (response.ok) {
        const blob = await response.blob();
        downloadBlob(blob, item.filename ?? "download");
        return true;
      }
    } catch {
      // CORS blocked, fallback to link click
    }

    // Fallback: create a download link
    const link = document.createElement("a");
    link.href = item.url;
    link.download = item.filename ?? "download";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error("Download failed:", error);
    return false;
  }
}

/**
 * Download multiple media items with progress callback
 */
export async function downloadAllMedia(
  items: MediaItem[],
  onProgress?: (completed: number, total: number, current: MediaItem) => void
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    onProgress?.(i, items.length, item);

    const result = await downloadMedia(item);
    if (result) {
      success++;
    } else {
      failed++;
    }

    // Small delay between downloads to prevent browser blocking
    if (i < items.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  onProgress?.(items.length, items.length, items[items.length - 1]);
  return { success, failed };
}

/**
 * Click the native download button for an image (uses Gemini's download)
 */
export function clickNativeDownloadButton(imageElement: HTMLImageElement): boolean {
  // Find the closest generated-image-controls container
  const container = imageElement.closest(".generated-image, response-element, model-response");
  if (!container) return false;

  // Look for the download button
  const downloadSelectors = [
    "download-generated-image-button button",
    'button[data-test-id="download-generated-image-button"]',
    'button[aria-label*="Download"]',
    'button[aria-label*="download"]',
    ".download-button",
  ];

  for (const selector of downloadSelectors) {
    const btn = container.querySelector<HTMLElement>(selector);
    if (btn) {
      btn.click();
      return true;
    }
  }

  return false;
}

/**
 * Use Gemini's native download for all visible images
 */
export async function downloadAllViaNativeButtons(): Promise<number> {
  let count = 0;

  // Find all download buttons
  const downloadButtons = document.querySelectorAll(
    'download-generated-image-button button, button[data-test-id="download-generated-image-button"]'
  );

  for (const btn of downloadButtons) {
    const button = btn as HTMLButtonElement;
    if (button.offsetParent !== null) {
      // Button is visible
      button.click();
      count++;
      // Wait for download to start
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return count;
}

// Helper functions

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function generateFilename(type: string, index: number, extension: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  return `gemini_${type}_${timestamp}_${index}.${extension}`;
}

function getExtensionFromUrl(url: string): string {
  if (url.startsWith("data:")) {
    const match = /data:image\/(\w+)/.exec(url);
    return match ? match[1] : "png";
  }

  try {
    const pathname = new URL(url).pathname;
    const ext = pathname.split(".").pop()?.toLowerCase();
    if (ext && ["jpg", "jpeg", "png", "gif", "webp", "svg", "mp4", "webm", "mov"].includes(ext)) {
      return ext;
    }
  } catch {
    // Invalid URL
  }

  return "png";
}

function extractFilenameFromUrl(url: string): string | null {
  try {
    const pathname = new URL(url).pathname;
    const parts = pathname.split("/");
    return parts[parts.length - 1] || null;
  } catch {
    return null;
  }
}

function getMimeType(url: string): string {
  const ext = getExtensionFromUrl(url).toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  return mimeTypes[ext] || "application/octet-stream";
}

import "./style.css";

import {
  BookMarked,
  Clock,
  Cpu,
  Download,
  GripVertical,
  Info,
  Pause,
  Play,
  Settings as SettingsIcon,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";

import { CsvDialog } from "@/components/CsvDialog";
import { OnboardingModal } from "@/components/OnboardingModal";
import { QueuePanel } from "@/components/QueuePanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import { TemplatesPanel } from "@/components/TemplatesPanel";
import { improvePrompt } from "@/services/promptOptimizationService";
import {
  DEFAULT_SETTINGS,
  getFolders,
  getQueue,
  getSettings,
  hasAnyAIKey,
  isOnboardingComplete,
  onStorageChange,
  setFolders,
  setOnboardingComplete,
  setQueue,
  setSettings,
} from "@/services/storageService";
import {
  GeminiTool,
  MessageType,
  QueueStatus,
  STORAGE_KEYS,
  SidebarPosition,
  ThemeMode,
  type AppSettings,
  type ExtensionMessage,
  type Folder,
  type PromptTemplate,
  type QueueItem,
} from "@/types";

import { automationModule } from "./automation";

type TabType = "queue" | "templates" | "settings";

// Constants for sidebar resize
const MIN_SIDEBAR_WIDTH = 280;
const MAX_SIDEBAR_WIDTH = 600;

function InjectableSidebar() {
  const [queue, setQueueState] = useState<QueueItem[]>([]);
  const [folders, setFoldersState] = useState<Folder[]>([]);
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("queue");
  const [activeTimer, setActiveTimer] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCsvDialog, setShowCsvDialog] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SETTINGS.sidebarWidth);

  const sidebarRef = useRef<HTMLDivElement>(null);

  const isDark = settings.theme === ThemeMode.DARK;
  const isLeft = settings.position === SidebarPosition.LEFT;

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      const [queueData, settingsData, foldersData, onboardingDone] = await Promise.all([
        getQueue(),
        getSettings(),
        getFolders(),
        isOnboardingComplete(),
      ]);

      setQueueState(queueData);
      setSettingsState(settingsData);
      setFoldersState(foldersData);
      setShowOnboarding(!onboardingDone);
      // Set sidebar width from saved settings
      if (settingsData.sidebarWidth) {
        setSidebarWidth(settingsData.sidebarWidth);
      }
    };

    loadData();
  }, []);

  // Listen for storage changes
  useEffect(() => {
    const cleanup = onStorageChange((changes) => {
      if (changes[STORAGE_KEYS.QUEUE].newValue) {
        setQueueState(changes[STORAGE_KEYS.QUEUE].newValue as QueueItem[]);
      }
      if (changes[STORAGE_KEYS.SETTINGS].newValue) {
        setSettingsState(changes[STORAGE_KEYS.SETTINGS].newValue as AppSettings);
      }
      if (changes[STORAGE_KEYS.FOLDERS].newValue) {
        setFoldersState(changes[STORAGE_KEYS.FOLDERS].newValue as Folder[]);
      }
    });

    return cleanup;
  }, []);

  // Listen for messages from background
  useEffect(() => {
    const handleMessage = (message: ExtensionMessage) => {
      if (message.type === MessageType.PROCESS_QUEUE) {
        setIsProcessing(true);
      } else if (message.type === MessageType.STOP_PROCESSING) {
        setIsProcessing(false);
      } else if (message.type === MessageType.UPDATE_QUEUE) {
        setQueueState(message.payload as QueueItem[]);
      } else if (message.type === MessageType.TOGGLE_SIDEBAR) {
        setIsVisible((prev) => !prev);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  // Active timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isProcessing) {
      interval = setInterval(() => {
        setActiveTimer((t) => t + 100);
      }, 100);
    } else {
      setActiveTimer(0);
    }
    return () => {
      clearInterval(interval);
    };
  }, [isProcessing]);

  // Resize handler
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      let newWidth: number;

      if (isLeft) {
        // For left sidebar, calculate from left edge
        newWidth = e.clientX;
      } else {
        // For right sidebar, calculate from right edge
        newWidth = window.innerWidth - e.clientX;
      }

      // Clamp to min/max bounds
      newWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, newWidth));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = async () => {
      setIsResizing(false);
      // Save the new width to storage
      await setSettings({ sidebarWidth });
    };

    // Add listeners to document for smoother resizing
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    // Add cursor style to body during resize
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, isLeft, sidebarWidth]);

  // Queue handlers
  const constructFinalPrompt = useCallback(
    (original: string) => {
      let p = `${settings.prefix} ${original} ${settings.suffix}`.trim();
      if (settings.globalNegativesEnabled && settings.globalNegatives.trim()) {
        p += `. NOT ${settings.globalNegatives.trim()}`;
      }
      return p;
    },
    [settings.prefix, settings.suffix, settings.globalNegatives, settings.globalNegativesEnabled]
  );

  const handleAddToQueue = useCallback(
    async (text?: string, templateText?: string, images?: string[], tool?: GeminiTool) => {
      const sourceText = text ?? "";

      // Smart parsing: split by blank lines (paragraphs) - each paragraph is one prompt
      // This allows multi-line prompts when separated by blank lines
      // Also detect numbered patterns (e.g., "Prompt 1:", "1.", "1)") to preserve full prompts

      // Split by blank lines (one or more empty lines between paragraphs)
      const paragraphs = sourceText
        .split(/\n\s*\n+/)
        .map((p) => p.trim())
        .filter((p) => p !== "");

      let lines = paragraphs.flatMap((paragraph) => {
        // Replace internal newlines with spaces to create a single prompt
        const normalized = paragraph.replace(/\n/g, " ").trim();
        if (!normalized) return [];

        // Detect numbered patterns (e.g., "Prompt 1:", "1.", "1)")
        const numberedPattern = /^(?:Prompt\s+)?\d+[.:)]\s+/i;

        // If paragraph starts with a numbered pattern, treat entire paragraph as one prompt
        if (numberedPattern.test(normalized)) {
          return [normalized];
        }

        // Only split by commas if they appear to be explicit list separators
        // (comma followed by space and capital letter, indicating start of new item)
        // or if there are multiple commas suggesting a list format
        const hasMultipleCommas = (normalized.match(/,/g) ?? []).length > 1;
        const commaBeforeCapital = /,\s+[A-Z]/;

        if (hasMultipleCommas && commaBeforeCapital.test(normalized)) {
          // Split on commas that are followed by space and capital letter
          return normalized
            .split(/,\s+(?=[A-Z])/)
            .map((item) => item.trim())
            .filter((item) => item !== "");
        }

        // Otherwise, treat the entire paragraph as one prompt
        return [normalized];
      });

      // If no text but images are provided, create a single item with empty prompt
      // This handles templates that only have reference images
      if (lines.length === 0 && images && images.length > 0) {
        lines = [""];
      }

      // Don't add anything if there's no text and no images
      if (lines.length === 0) {
        return;
      }

      const newItems: QueueItem[] = lines.map((line) => {
        const combinedPrompt = templateText ? `${line} ${templateText}` : line;
        return {
          id: Math.random().toString(36).substring(2, 9),
          originalPrompt: line,
          finalPrompt: constructFinalPrompt(combinedPrompt),
          status: QueueStatus.IDLE,
          tool: tool ?? settings.defaultTool,
          images: images && images.length > 0 ? [...images] : undefined,
        };
      });

      const updatedQueue = [...queue, ...newItems];
      setQueueState(updatedQueue);
      await setQueue(updatedQueue);
    },
    [queue, constructFinalPrompt, settings.defaultTool]
  );

  const handleRemoveFromQueue = useCallback(
    async (id: string) => {
      const updatedQueue = queue.filter((item) => item.id !== id);
      setQueueState(updatedQueue);
      await setQueue(updatedQueue);
    },
    [queue]
  );

  const handleClearAll = useCallback(async () => {
    setQueueState([]);
    await setQueue([]);
  }, []);

  const handleRetryQueueItem = useCallback(
    async (id: string) => {
      const updatedQueue = queue.map((item) =>
        item.id === id ? { ...item, status: QueueStatus.IDLE, error: undefined } : item
      );
      setQueueState(updatedQueue);
      await setQueue(updatedQueue);
    },
    [queue]
  );

  const handleCsvUpload = useCallback(
    async (items: { prompt: string; tool?: string; images?: string[] }[]) => {
      const newItems: QueueItem[] = items.map((item) => {
        // Map tool string to GeminiTool enum
        const toolMap: Record<string, GeminiTool> = {
          image: GeminiTool.IMAGE,
          canvas: GeminiTool.CANVAS,
          video: GeminiTool.VIDEO,
          research: GeminiTool.DEEP_RESEARCH,
          learning: GeminiTool.LEARNING,
          layout: GeminiTool.VISUAL_LAYOUT,
        };
        const tool = item.tool ? toolMap[item.tool.toLowerCase()] ?? settings.defaultTool : settings.defaultTool;

        return {
          id: Math.random().toString(36).substring(2, 9),
          originalPrompt: item.prompt,
          finalPrompt: constructFinalPrompt(item.prompt),
          status: QueueStatus.IDLE,
          tool,
          images: item.images && item.images.length > 0 ? item.images : undefined,
        };
      });

      const updatedQueue = [...queue, ...newItems];
      setQueueState(updatedQueue);
      await setQueue(updatedQueue);
    },
    [queue, constructFinalPrompt, settings.defaultTool]
  );

  // Processing handlers
  const toggleProcessing = useCallback(async () => {
    if (isProcessing) {
      await chrome.runtime.sendMessage({ type: MessageType.STOP_PROCESSING });
      setIsProcessing(false);
    } else {
      await chrome.runtime.sendMessage({ type: MessageType.PROCESS_QUEUE });
      setIsProcessing(true);
    }
  }, [isProcessing]);

  // Settings handlers
  const handleUpdateSettings = useCallback(
    async (updates: Partial<AppSettings>) => {
      const updatedSettings = { ...settings, ...updates };
      setSettingsState(updatedSettings);
      await setSettings(updatedSettings);
    },
    [settings]
  );

  // Folder handlers
  const handleCreateFolder = useCallback(
    async (name: string) => {
      const newFolder: Folder = {
        id: Math.random().toString(36).substring(2, 9),
        name,
        templates: [],
        isOpen: true,
      };
      const updatedFolders = [...folders, newFolder];
      setFoldersState(updatedFolders);
      await setFolders(updatedFolders);
    },
    [folders]
  );

  const handleDeleteFolder = useCallback(
    async (id: string) => {
      const updatedFolders = folders.filter((f) => f.id !== id);
      setFoldersState(updatedFolders);
      await setFolders(updatedFolders);
    },
    [folders]
  );

  const handleToggleFolder = useCallback(
    async (id: string) => {
      const updatedFolders = folders.map((f) => (f.id === id ? { ...f, isOpen: !f.isOpen } : f));
      setFoldersState(updatedFolders);
      await setFolders(updatedFolders);
    },
    [folders]
  );

  const handleUseTemplate = useCallback(
    (folderId: string, templateId: string) => {
      const folder = folders.find((f) => f.id === folderId);
      const template = folder?.templates.find((t) => t.id === templateId);
      if (template) {
        handleAddToQueue(template.text, undefined, template.images);
        setActiveTab("queue");
      }
    },
    [folders, handleAddToQueue]
  );

  const handleDeleteTemplate = useCallback(
    async (folderId: string, templateId: string) => {
      const updatedFolders = folders.map((f) =>
        f.id === folderId ? { ...f, templates: f.templates.filter((t) => t.id !== templateId) } : f
      );
      setFoldersState(updatedFolders);
      await setFolders(updatedFolders);
    },
    [folders]
  );

  const handleSaveTemplate = useCallback(
    async (folderId: string, template: Partial<PromptTemplate>) => {
      const updatedFolders = folders.map((f) => {
        if (f.id === folderId) {
          const existingIdx = f.templates.findIndex((t) => t.id === template.id);
          const updatedTemplate: PromptTemplate = {
            id: template.id ?? Math.random().toString(36).substring(2, 9),
            name: template.name ?? "Unnamed",
            text: template.text ?? "",
            createdAt: template.createdAt ?? Date.now(),
            lastEditedAt: Date.now(),
            timesUsed: template.timesUsed ?? 0,
            images: template.images ?? [],
          };

          if (existingIdx > -1) {
            const newTemplates = [...f.templates];
            newTemplates[existingIdx] = updatedTemplate;
            return { ...f, templates: newTemplates };
          } else {
            return { ...f, templates: [...f.templates, updatedTemplate] };
          }
        }
        return f;
      });
      setFoldersState(updatedFolders);
      await setFolders(updatedFolders);
    },
    [folders]
  );

  const handleImproveTemplate = useCallback(
    async (folderId: string, templateId: string) => {
      const folder = folders.find((f) => f.id === folderId);
      const template = folder?.templates.find((t) => t.id === templateId);
      if (template) {
        const improvedText = await improvePrompt(template.text, settings);
        const updatedFolders = folders.map((f) =>
          f.id === folderId
            ? {
                ...f,
                templates: f.templates.map((t) =>
                  t.id === templateId ? { ...t, text: improvedText, lastEditedAt: Date.now() } : t
                ),
              }
            : f
        );
        setFoldersState(updatedFolders);
        await setFolders(updatedFolders);
      }
    },
    [folders, settings]
  );

  const handleImproveFolder = useCallback(
    async (folderId: string) => {
      const folder = folders.find((f) => f.id === folderId);
      if (!folder) return;

      const improvedTemplates = await Promise.all(
        folder.templates.map(async (t) => {
          const improvedText = await improvePrompt(t.text, settings);
          return { ...t, text: improvedText, lastEditedAt: Date.now() };
        })
      );

      const updatedFolders = folders.map((f) =>
        f.id === folderId ? { ...f, templates: improvedTemplates } : f
      );
      setFoldersState(updatedFolders);
      await setFolders(updatedFolders);
    },
    [folders, settings]
  );

  // Onboarding
  const handleCompleteOnboarding = useCallback(async () => {
    await setOnboardingComplete(true);
    setShowOnboarding(false);
  }, []);

  if (!isVisible) return null;

  // Collapsed state - show only toggle button
  if (isCollapsed) {
    return (
      <div
        className={`nano-flow-collapsed ${isLeft ? "nano-flow-left" : "nano-flow-right"}`}
        style={{
          position: "fixed",
          top: "50%",
          transform: "translateY(-50%)",
          [isLeft ? "left" : "right"]: "0",
          zIndex: 999999,
          pointerEvents: "auto",
        }}
      >
        <button
          onClick={() => {
            setIsCollapsed(false);
          }}
          title="Open Nano Flow panel"
          className={`rounded-md p-2 shadow-lg transition-all ${
            isDark
              ? "border border-white/10 bg-[#1a1a1a] text-white"
              : "border border-slate-200 bg-white text-slate-800"
          }`}
          style={{
            borderRadius: isLeft ? "0 8px 8px 0" : "8px 0 0 8px",
          }}
        >
          <div className="flex items-center gap-1">
            <img
              src={chrome.runtime.getURL("icons/icon-16.png")}
              alt="Nano Flow"
              className="h-4 w-4"
            />
            <GripVertical size={12} className="opacity-50" />
          </div>
        </button>
      </div>
    );
  }

  return (
    <div
      ref={sidebarRef}
      className={`nano-flow-sidebar ${isLeft ? "nano-flow-left" : "nano-flow-right"}`}
      style={{
        position: "fixed",
        top: 0,
        bottom: 0,
        [isLeft ? "left" : "right"]: 0,
        width: `${sidebarWidth}px`,
        zIndex: 999999,
        display: "flex",
        flexDirection: isLeft ? "row" : "row-reverse",
        pointerEvents: "auto",
      }}
    >
      {/* Resize Handle */}
      <div
        onMouseDown={(e) => {
          e.preventDefault();
          setIsResizing(true);
        }}
        className={`group flex w-2 cursor-ew-resize items-center justify-center transition-colors ${
          isDark ? "hover:bg-blue-500/30" : "hover:bg-blue-500/20"
        } ${isResizing ? (isDark ? "bg-blue-500/40" : "bg-blue-500/30") : ""}`}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          [isLeft ? "right" : "left"]: 0,
          zIndex: 10,
        }}
        title="Drag to resize"
      >
        <div
          className={`h-8 w-1 rounded-full transition-colors ${
            isDark ? "bg-white/20 group-hover:bg-blue-400" : "bg-black/20 group-hover:bg-blue-500"
          } ${isResizing ? (isDark ? "bg-blue-400" : "bg-blue-500") : ""}`}
        />
      </div>

      <div
        className={`flex h-full flex-1 flex-col overflow-hidden transition-colors duration-500 ${isDark ? "bg-[#0a0a0a] text-white" : "bg-[#f8fafc] text-[#1e293b]"}`}
        style={{
          borderLeft: isLeft
            ? "none"
            : `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
          borderRight: isLeft
            ? `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`
            : "none",
        }}
      >
        {/* Onboarding */}
        {showOnboarding && (
          <OnboardingModal
            onComplete={() => {
              handleCompleteOnboarding().catch(() => {});
            }}
            isDark={isDark}
            onSwitchTab={setActiveTab}
          />
        )}

        {/* CSV Dialog */}
        <CsvDialog
          isOpen={showCsvDialog}
          isDark={isDark}
          onClose={() => {
            setShowCsvDialog(false);
          }}
          onUpload={(items) => {
            handleCsvUpload(items).catch(() => {});
          }}
        />

        {/* Header */}
        <div
          data-onboarding="sidebar-header"
          className={`flex items-center justify-between border-b p-2 ${isDark ? "border-white/10 bg-white/5" : "border-slate-100 bg-slate-50"}`}
        >
          <div className="flex items-center gap-2">
            <img
              src={chrome.runtime.getURL("icons/icon-32.png")}
              alt="Nano Flow"
              className="h-6 w-6 rounded-md"
            />
            <h1 className="text-sm font-black tracking-tight">Nano Flow</h1>
          </div>
          <div className="flex items-center gap-2">
            {isProcessing && (
              <div className="flex items-center gap-1 rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5">
                <Clock size={10} className="animate-spin text-blue-500" />
                <span className="text-[10px] font-black text-blue-500">
                  {(activeTimer / 1000).toFixed(1)}s
                </span>
              </div>
            )}
            <button
              onClick={() => {
                setIsCollapsed(true);
              }}
              title="Minimize panel"
              className={`rounded p-1 opacity-50 transition-opacity hover:opacity-100 ${isDark ? "hover:bg-white/10" : "hover:bg-black/5"}`}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav
          className={`flex overflow-hidden border-b ${isDark ? "bg-white/2 border-white/5" : "border-slate-100"}`}
        >
          {[
            {
              id: "queue" as const,
              icon: Cpu,
              label: "Queue",
              tooltip: "Add prompts and process them in batch through Gemini",
            },
            {
              id: "templates" as const,
              icon: BookMarked,
              label: "Templates",
              tooltip: "Save your favorite prompts and improve them with AI",
            },
            {
              id: "settings" as const,
              icon: SettingsIcon,
              label: "Settings",
              tooltip: "Configure API key, prefixes, negatives, and more",
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
              }}
              className={`group relative flex flex-1 flex-col items-center gap-1 py-3 text-[8px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id ? "text-blue-500" : "opacity-40 hover:opacity-100"
              }`}
            >
              <div className="flex items-center gap-0.5">
                <tab.icon size={14} />
                <span
                  title={tab.tooltip}
                  className="opacity-0 transition-opacity group-hover:opacity-50"
                >
                  <Info size={8} />
                </span>
              </div>
              <span className="w-full truncate px-1 text-center">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-2 right-2 h-0.5 rounded-t-md bg-blue-500" />
              )}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="no-scrollbar flex-1 overflow-y-auto p-2">
          {activeTab === "queue" && (
            <QueuePanel
              queue={queue}
              isDark={isDark}
              defaultTool={settings.defaultTool}
              onAddToQueue={handleAddToQueue}
              onRemoveFromQueue={handleRemoveFromQueue}
              onRetryQueueItem={handleRetryQueueItem}
              onClearAll={handleClearAll}
              onOpenCsvDialog={() => {
                setShowCsvDialog(true);
              }}
            />
          )}

          {activeTab === "templates" && (
            <div data-onboarding="templates-panel">
              <TemplatesPanel
                folders={folders}
                isDark={isDark}
                hasAIKey={hasAnyAIKey(settings)}
                onCreateFolder={handleCreateFolder}
                onDeleteFolder={handleDeleteFolder}
                onToggleFolder={handleToggleFolder}
                onUseTemplate={handleUseTemplate}
                onDeleteTemplate={handleDeleteTemplate}
                onSaveTemplate={handleSaveTemplate}
                onImproveTemplate={handleImproveTemplate}
                onImproveFolder={handleImproveFolder}
              />
            </div>
          )}

          {activeTab === "settings" && (
            <div data-onboarding="settings-panel">
              <SettingsPanel
                settings={settings}
                isDark={isDark}
                onUpdateSettings={handleUpdateSettings}
              />
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div
          className={`space-y-2 border-t p-2 ${isDark ? "border-white/10 bg-black/80 backdrop-blur-xl" : "border-slate-200 bg-slate-50"}`}
        >
          <div className="flex gap-2">
            <button
              data-onboarding="start-button"
              onClick={() => {
                toggleProcessing().catch(() => {});
              }}
              disabled={queue.length === 0}
              title={isProcessing ? "Stop processing queue" : "Start processing queue"}
              className={`flex flex-[4] items-center justify-center gap-2 rounded-md p-2 text-xs font-black uppercase shadow-xl transition-all active:scale-[0.98] ${
                isProcessing ? "bg-amber-500 shadow-amber-500/30" : "bg-blue-600 shadow-blue-600/30"
              } text-white disabled:opacity-30`}
            >
              {isProcessing ? (
                <Pause size={16} fill="currentColor" />
              ) : (
                <Play size={16} fill="currentColor" />
              )}
              {isProcessing ? "Stop" : "Start"}
            </button>
          </div>

          {/* Results Preview */}
          {queue.filter((item) => item.status === QueueStatus.COMPLETED).length > 0 && (
            <div className="no-scrollbar flex gap-1 overflow-x-auto py-1">
              {queue
                .filter((item) => item.status === QueueStatus.COMPLETED)
                .slice(-5)
                .map((item) => {
                  const resultUrl = item.results?.flash?.url ?? item.results?.pro?.url;
                  return resultUrl ? (
                    <div key={item.id} className="group relative shrink-0">
                      <img
                        src={resultUrl}
                        className="h-12 w-12 rounded-md border border-white/10 object-cover"
                        alt="Result"
                      />
                      <button
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = resultUrl;
                          link.download = `nano_flow_${item.id}.png`;
                          link.click();
                        }}
                        title="Download image"
                        className="absolute inset-0 flex items-center justify-center rounded-md bg-black/60 opacity-0 transition-all group-hover:opacity-100"
                      >
                        <Download size={12} className="text-white" />
                      </button>
                    </div>
                  ) : null;
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Content script definition
export default defineContentScript({
  matches: ["*://gemini.google.com/*"],
  runAt: "document_idle",
  cssInjectionMode: "ui",

  async main(ctx) {
    // Initialize automation module
    automationModule.init();

    // Create UI using shadow root for style isolation
    const ui = await createShadowRootUi(ctx, {
      name: "nano-flow-sidebar",
      position: "overlay",
      onMount: (container) => {
        // Ensure the container fills the viewport for fixed positioning to work
        container.style.position = "fixed";
        container.style.display = "block";
        container.style.top = "0px";
        container.style.left = "0";
        container.style.right = "0";
        container.style.bottom = "0";
        container.style.pointerEvents = "none";
        container.style.zIndex = "2147483647";

        const root = ReactDOM.createRoot(container);
        root.render(<InjectableSidebar />);
        return root;
      },
      onRemove: (root) => {
        root?.unmount();
      },
    });

    // Mount the UI
    ui.mount();
  },
});

import {
  BookMarked,
  CheckCheck,
  Clock,
  Cpu,
  Download,
  Info,
  Pause,
  Play,
  Settings as SettingsIcon,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { ApiKeyDialog } from "@/components/ApiKeyDialog";
import { CsvDialog } from "@/components/CsvDialog";
import { OnboardingModal } from "@/components/OnboardingModal";
import { QueuePanel } from "@/components/QueuePanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import { TemplatesPanel } from "@/components/TemplatesPanel";
import { improvePrompt } from "@/services/geminiService";
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
  ThemeMode,
  type AppSettings,
  type ExtensionMessage,
  type ExtensionResponse,
  type Folder,
  type PromptTemplate,
  type QueueItem,
} from "@/types";

type TabType = "queue" | "templates" | "settings";

export default function App() {
  const [queue, setQueueState] = useState<QueueItem[]>([]);
  const [folders, setFoldersState] = useState<Folder[]>([]);
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("queue");
  const [activeTimer, setActiveTimer] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCsvDialog, setShowCsvDialog] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  const isDark = settings.theme === ThemeMode.DARK;

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
    };

    loadData();
  }, []);

  // Listen for storage changes
  useEffect(() => {
    const cleanup = onStorageChange((changes) => {
      if (STORAGE_KEYS.QUEUE in changes && changes[STORAGE_KEYS.QUEUE]) {
        setQueueState(changes[STORAGE_KEYS.QUEUE].newValue ?? []);
      }
      if (STORAGE_KEYS.SETTINGS in changes && changes[STORAGE_KEYS.SETTINGS]) {
        setSettingsState(changes[STORAGE_KEYS.SETTINGS].newValue ?? DEFAULT_SETTINGS);
      }
      if (STORAGE_KEYS.FOLDERS in changes && changes[STORAGE_KEYS.FOLDERS]) {
        setFoldersState(changes[STORAGE_KEYS.FOLDERS].newValue ?? []);
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

  // Helper function to send messages to background
  const sendMessage = async <T,>(message: ExtensionMessage): Promise<ExtensionResponse<T>> => {
    return chrome.runtime.sendMessage(message);
  };

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

      // Smart parsing: prioritize newlines, only split by commas when they appear to be list separators
      // Detect numbered patterns (e.g., "Prompt 1:", "1.", "1)") to preserve full prompts
      const numberedPattern = /^(?:Prompt\s+)?\d+[.:)]\s+/i;

      // Split by newlines first
      const newlineSplit = sourceText.split(/\n/);
      const lines = newlineSplit.flatMap((line) => {
        const trimmed = line.trim();
        if (!trimmed) return [];

        // If line starts with a numbered pattern, treat entire line as one prompt
        // This handles cases like "Prompt 1: ..." or "1. ..."
        if (numberedPattern.test(trimmed)) {
          return [trimmed];
        }

        // Only split by commas if they appear to be explicit list separators
        // (comma followed by space and capital letter, indicating start of new item)
        // or if there are multiple commas suggesting a list format
        const hasMultipleCommas = (trimmed.match(/,/g) ?? []).length > 1;
        const commaBeforeCapital = /,\s+[A-Z]/;

        if (hasMultipleCommas && commaBeforeCapital.test(trimmed)) {
          // Split on commas that are followed by space and capital letter
          return trimmed
            .split(/,\s+(?=[A-Z])/)
            .map((item) => item.trim())
            .filter((item) => item !== "");
        }

        // Otherwise, treat the entire line as one prompt
        return [trimmed];
      });

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

  const handleRetryQueueItem = useCallback(
    async (id: string) => {
      const updatedQueue = queue.map((item) =>
        item.id === id
          ? {
              ...item,
              status: QueueStatus.IDLE,
              error: undefined,
              startTime: undefined,
              endTime: undefined,
              completionTimeSeconds: undefined,
              results: undefined,
            }
          : item
      );
      setQueueState(updatedQueue);
      await setQueue(updatedQueue);
    },
    [queue]
  );

  const handleClearAll = useCallback(() => {
    setShowClearAllConfirm(true);
  }, []);

  const confirmClearAll = useCallback(async () => {
    setQueueState([]);
    await setQueue([]);
    setShowClearAllConfirm(false);
  }, []);

  const handleClearCompleted = useCallback(async () => {
    const updatedQueue = queue.filter((item) => item.status !== QueueStatus.COMPLETED);
    setQueueState(updatedQueue);
    await setQueue(updatedQueue);
  }, [queue]);

  const handleCsvUpload = useCallback(
    async (items: { prompt: string; tool?: string; images?: string[] }[]) => {
      const newItems: QueueItem[] = items.map((item) => {
        // Map tool string to GeminiTool enum
        let tool: GeminiTool | undefined = undefined;
        if (item.tool) {
          const toolLower = item.tool.toLowerCase().trim();
          // Map common tool names to enum values
          if (toolLower === "image" || toolLower === "imagen") {
            tool = GeminiTool.IMAGE;
          } else if (toolLower === "canvas") {
            tool = GeminiTool.CANVAS;
          } else if (toolLower === "video" || toolLower === "veo") {
            tool = GeminiTool.VIDEO;
          } else if (toolLower === "research" || toolLower === "deep_research") {
            tool = GeminiTool.DEEP_RESEARCH;
          } else if (toolLower === "learning") {
            tool = GeminiTool.LEARNING;
          } else if (toolLower === "layout" || toolLower === "visual_layout") {
            tool = GeminiTool.VISUAL_LAYOUT;
          } else if (toolLower === "none" || toolLower === "") {
            tool = GeminiTool.NONE;
          } else {
            // Try to match by enum key
            const toolKey = Object.keys(GeminiTool).find(
              (key) =>
                key.toLowerCase() === toolLower ||
                GeminiTool[key as keyof typeof GeminiTool].toLowerCase() === toolLower
            );
            if (toolKey) {
              tool = GeminiTool[toolKey as keyof typeof GeminiTool] as GeminiTool;
            }
          }
        }

        return {
          id: Math.random().toString(36).substring(2, 9),
          originalPrompt: item.prompt,
          finalPrompt: constructFinalPrompt(item.prompt),
          status: QueueStatus.IDLE,
          tool: tool ?? settings.defaultTool,
          images: item.images && item.images.length > 0 ? [...item.images] : undefined,
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
      await sendMessage({ type: MessageType.STOP_PROCESSING });
      setIsProcessing(false);
    } else {
      await sendMessage({ type: MessageType.PROCESS_QUEUE });
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

  const handleSaveApiKey = useCallback(
    async (apiKey: string) => {
      await handleUpdateSettings({ apiKey });
    },
    [handleUpdateSettings]
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
        const improvedText = await improvePrompt(template.text);
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
    [folders]
  );

  const handleImproveFolder = useCallback(
    async (folderId: string) => {
      const folder = folders.find((f) => f.id === folderId);
      if (!folder) return;

      const improvedTemplates = await Promise.all(
        folder.templates.map(async (t) => {
          const improvedText = await improvePrompt(t.text);
          return { ...t, text: improvedText, lastEditedAt: Date.now() };
        })
      );

      const updatedFolders = folders.map((f) =>
        f.id === folderId ? { ...f, templates: improvedTemplates } : f
      );
      setFoldersState(updatedFolders);
      await setFolders(updatedFolders);
    },
    [folders]
  );

  // Onboarding
  const handleCompleteOnboarding = useCallback(async () => {
    await setOnboardingComplete(true);
    setShowOnboarding(false);
  }, []);

  return (
    <div
      className={`flex h-screen w-full flex-col overflow-hidden transition-colors duration-500 ${
        isDark ? "bg-[#0a0a0a] text-white" : "bg-[#f8fafc] text-[#1e293b]"
      }`}
    >
      {/* Onboarding */}
      {showOnboarding && (
        <OnboardingModal
          onComplete={() => {
            handleCompleteOnboarding().catch(() => {});
          }}
          isDark={isDark}
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

      {/* API Key Dialog */}
      <ApiKeyDialog
        isOpen={showApiKeyDialog}
        isDark={isDark}
        currentKey={settings.aiApiKeys.gemini}
        onClose={() => {
          setShowApiKeyDialog(false);
        }}
        onSave={(key) => {
          handleSaveApiKey(key).catch(() => {});
        }}
      />

      {/* Header */}
      <div
        className={`flex items-center justify-between border-b p-2 ${isDark ? "border-white/10 bg-white/5" : "border-slate-100 bg-slate-50"}`}
      >
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-blue-600 p-1 shadow-lg shadow-blue-600/20">
            <Sparkles size={16} className="text-white" />
          </div>
          <h1 className="text-sm font-black tracking-tight">Nano Flow</h1>
        </div>
        {isProcessing && (
          <div className="flex items-center gap-1 rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5">
            <Clock size={10} className="animate-spin text-blue-500" />
            <span className="text-[10px] font-black text-blue-500">
              {(activeTimer / 1000).toFixed(1)}s
            </span>
          </div>
        )}
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
              <Info
                size={8}
                className="opacity-0 transition-opacity group-hover:opacity-50"
                data-tooltip-id="tooltip"
                data-tooltip-content={tab.tooltip}
              />
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
        )}

        {activeTab === "settings" && (
          <SettingsPanel
            settings={settings}
            isDark={isDark}
            onUpdateSettings={handleUpdateSettings}
          />
        )}
      </div>

      {/* Clear All Confirmation Dialog */}
      {showClearAllConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className={`mx-4 w-full max-w-sm rounded-lg border p-4 shadow-2xl ${
              isDark ? "border-white/20 bg-gray-900" : "border-slate-200 bg-white"
            }`}
          >
            <h3 className={`mb-2 text-sm font-black ${isDark ? "text-white" : "text-gray-900"}`}>
              Clear All Queue Items?
            </h3>
            <p className={`mb-4 text-xs ${isDark ? "text-white/70" : "text-gray-600"}`}>
              This will permanently delete all {queue.length} item{queue.length !== 1 ? "s" : ""} in
              the queue. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowClearAllConfirm(false);
                }}
                className={`flex-1 rounded-md border px-3 py-2 text-xs font-bold uppercase transition-all ${
                  isDark
                    ? "border-white/20 bg-white/5 hover:bg-white/10"
                    : "border-slate-200 bg-slate-100 hover:bg-slate-200"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmClearAll().catch(() => {});
                }}
                className="flex-1 rounded-md bg-red-600 px-3 py-2 text-xs font-bold uppercase text-white transition-all hover:bg-red-700 active:scale-95"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Controls */}
      <div
        className={`space-y-2 border-t p-2 ${isDark ? "border-white/10 bg-black/80 backdrop-blur-xl" : "border-slate-200 bg-slate-50"}`}
      >
        <div className="flex gap-2">
          <button
            onClick={() => {
              handleClearCompleted().catch(() => {});
            }}
            disabled={queue.filter((item) => item.status === QueueStatus.COMPLETED).length === 0}
            title="Clear completed items"
            className={`flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-[10px] font-black uppercase transition-all ${
              isDark
                ? "border-green-500/30 bg-green-500/10 text-green-400 hover:border-green-500/50 hover:bg-green-500/20 disabled:opacity-30 disabled:hover:border-green-500/30 disabled:hover:bg-green-500/10"
                : "border-green-300 bg-green-50 text-green-700 hover:border-green-400 hover:bg-green-100 disabled:opacity-30 disabled:hover:border-green-300 disabled:hover:bg-green-50"
            }`}
          >
            <CheckCheck size={14} />
            <span className="hidden sm:inline">Clear Completed</span>
          </button>
          <button
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
  );
}

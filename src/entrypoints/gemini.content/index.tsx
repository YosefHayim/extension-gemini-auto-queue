import "./style.css";

import type { AppSettings, ExtensionMessage, ExtensionResponse, Folder, PromptTemplate, QueueItem } from "@/types";
import { BookMarked, Clock, Cpu, Download, GripVertical, Pause, Play, Settings as SettingsIcon, Sparkles, Trash2, X } from "lucide-react";
import {
  DEFAULT_SETTINGS,
  getFolders,
  getQueue,
  getSettings,
  isOnboardingComplete,
  onStorageChange,
  setFolders,
  setOnboardingComplete,
  setQueue,
  setSettings,
} from "@/services/storageService";
import { GeminiModel, MessageType, QueueStatus, STORAGE_KEYS, SidebarPosition, ThemeMode } from "@/types";
import React, { useCallback, useEffect, useState } from "react";

import { ApiKeyDialog } from "@/components/ApiKeyDialog";
import { CsvDialog } from "@/components/CsvDialog";
import { OnboardingModal } from "@/components/OnboardingModal";
import { QueuePanel } from "@/components/QueuePanel";
import ReactDOM from "react-dom/client";
import { SettingsPanel } from "@/components/SettingsPanel";
import { TemplatesPanel } from "@/components/TemplatesPanel";
import { automationModule } from "./automation";
import { improvePrompt } from "@/services/geminiService";

type TabType = "queue" | "templates" | "settings";

function InjectableSidebar() {
  const [queue, setQueueState] = useState<QueueItem[]>([]);
  const [folders, setFoldersState] = useState<Folder[]>([]);
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("queue");
  const [activeTimer, setActiveTimer] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCsvDialog, setShowCsvDialog] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isDark = settings.theme === ThemeMode.DARK;
  const isLeft = settings.position === SidebarPosition.LEFT;

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      const [queueData, settingsData, foldersData, onboardingDone] = await Promise.all([getQueue(), getSettings(), getFolders(), isOnboardingComplete()]);

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
      if (changes[STORAGE_KEYS.QUEUE]) {
        setQueueState(changes[STORAGE_KEYS.QUEUE].newValue || []);
      }
      if (changes[STORAGE_KEYS.SETTINGS]) {
        setSettingsState(changes[STORAGE_KEYS.SETTINGS].newValue || DEFAULT_SETTINGS);
      }
      if (changes[STORAGE_KEYS.FOLDERS]) {
        setFoldersState(changes[STORAGE_KEYS.FOLDERS].newValue || []);
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
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  // Active timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isProcessing) {
      interval = setInterval(() => setActiveTimer((t) => t + 100), 100);
    } else {
      setActiveTimer(0);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  // Queue handlers
  const constructFinalPrompt = useCallback(
    (original: string) => {
      let p = `${settings.prefix} ${original} ${settings.suffix}`.trim();
      if (settings.globalNegativesEnabled && settings.globalNegatives?.trim()) {
        p += `. NOT ${settings.globalNegatives.trim()}`;
      }
      return p;
    },
    [settings.prefix, settings.suffix, settings.globalNegatives, settings.globalNegativesEnabled]
  );

  const handleAddToQueue = useCallback(
    async (text?: string, templateText?: string, images?: string[]) => {
      const sourceText = text || "";
      const lines = sourceText
        .split(/[,\n]/)
        .map((line) => line.trim())
        .filter((line) => line !== "");

      const newItems: QueueItem[] = lines.map((line) => {
        const combinedPrompt = templateText ? `${line} ${templateText}` : line;
        return {
          id: Math.random().toString(36).substr(2, 9),
          originalPrompt: line,
          finalPrompt: constructFinalPrompt(combinedPrompt),
          status: QueueStatus.IDLE,
          images: images && images.length > 0 ? [...images] : undefined,
        };
      });

      const updatedQueue = [...queue, ...newItems];
      setQueueState(updatedQueue);
      await setQueue(updatedQueue);
    },
    [queue, constructFinalPrompt]
  );

  const handleRemoveFromQueue = useCallback(
    async (id: string) => {
      const updatedQueue = queue.filter((item) => item.id !== id);
      setQueueState(updatedQueue);
      await setQueue(updatedQueue);
    },
    [queue]
  );

  const handleClearCompleted = useCallback(async () => {
    const updatedQueue = queue.filter((item) => item.status !== QueueStatus.COMPLETED);
    setQueueState(updatedQueue);
    await setQueue(updatedQueue);
  }, [queue]);

  const handleCsvUpload = useCallback(
    async (items: Array<{ prompt: string; modifier?: string }>) => {
      const newItems: QueueItem[] = items.map((item) => {
        const combined = item.modifier ? `${item.prompt} ${item.modifier}` : item.prompt;
        return {
          id: Math.random().toString(36).substr(2, 9),
          originalPrompt: item.prompt,
          finalPrompt: constructFinalPrompt(combined),
          status: QueueStatus.IDLE,
        };
      });

      const updatedQueue = [...queue, ...newItems];
      setQueueState(updatedQueue);
      await setQueue(updatedQueue);
    },
    [queue, constructFinalPrompt]
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
        id: Math.random().toString(36).substr(2, 9),
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
      const updatedFolders = folders.map((f) => (f.id === folderId ? { ...f, templates: f.templates.filter((t) => t.id !== templateId) } : f));
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
            id: template.id || Math.random().toString(36).substr(2, 9),
            name: template.name || "Unnamed",
            text: template.text || "",
            createdAt: template.createdAt || Date.now(),
            lastEditedAt: Date.now(),
            timesUsed: template.timesUsed || 0,
            images: template.images || [],
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
                templates: f.templates.map((t) => (t.id === templateId ? { ...t, text: improvedText, lastEditedAt: Date.now() } : t)),
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

      const updatedFolders = folders.map((f) => (f.id === folderId ? { ...f, templates: improvedTemplates } : f));
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
        }}
      >
        <button
          onClick={() => setIsCollapsed(false)}
          className={`p-2 rounded-md shadow-lg transition-all ${
            isDark ? "bg-[#1a1a1a] text-white border border-white/10" : "bg-white text-slate-800 border border-slate-200"
          }`}
          style={{
            borderRadius: isLeft ? "0 8px 8px 0" : "8px 0 0 8px",
          }}
        >
          <div className="flex items-center gap-1">
            <Sparkles size={16} className="text-blue-500" />
            <GripVertical size={12} className="opacity-50" />
          </div>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`nano-flow-sidebar ${isLeft ? "nano-flow-left" : "nano-flow-right"}`}
      style={{
        position: "fixed",
        top: 0,
        bottom: 0,
        [isLeft ? "left" : "right"]: 0,
        width: "320px",
        zIndex: 999999,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        className={`flex flex-col h-full overflow-hidden transition-colors duration-500 ${isDark ? "bg-[#0a0a0a] text-white" : "bg-[#f8fafc] text-[#1e293b]"}`}
        style={{
          borderLeft: isLeft ? "none" : `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
          borderRight: isLeft ? `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}` : "none",
        }}
      >
        {/* Onboarding */}
        {showOnboarding && <OnboardingModal onComplete={handleCompleteOnboarding} isDark={isDark} />}

        {/* CSV Dialog */}
        <CsvDialog isOpen={showCsvDialog} isDark={isDark} onClose={() => setShowCsvDialog(false)} onUpload={handleCsvUpload} />

        {/* API Key Dialog */}
        <ApiKeyDialog
          isOpen={showApiKeyDialog}
          isDark={isDark}
          currentKey={settings.apiKey}
          onClose={() => setShowApiKeyDialog(false)}
          onSave={handleSaveApiKey}
        />

        {/* Header */}
        <div className={`p-2 flex items-center justify-between border-b ${isDark ? "border-white/10 bg-white/5" : "border-slate-100 bg-slate-50"}`}>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-blue-600 shadow-lg shadow-blue-600/20">
              <Sparkles size={16} className="text-white" />
            </div>
            <h1 className="text-sm font-black tracking-tight">Nano Flow</h1>
          </div>
          <div className="flex items-center gap-2">
            {isProcessing && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 rounded-md border border-blue-500/20">
                <Clock size={10} className="text-blue-500 animate-spin" />
                <span className="text-[10px] font-black text-blue-500">{(activeTimer / 1000).toFixed(1)}s</span>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(true)}
              className={`p-1 rounded opacity-50 hover:opacity-100 transition-opacity ${isDark ? "hover:bg-white/10" : "hover:bg-black/5"}`}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex border-b overflow-hidden ${isDark ? "border-white/5 bg-white/2" : "border-slate-100"}`}>
          {[
            { id: "queue" as const, icon: Cpu, label: "Queue" },
            { id: "templates" as const, icon: BookMarked, label: "Templates" },
            { id: "settings" as const, icon: SettingsIcon, label: "Settings" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-[8px] font-black uppercase tracking-widest flex flex-col items-center gap-1 transition-all relative ${
                activeTab === tab.id ? "text-blue-500" : "opacity-40 hover:opacity-100"
              }`}
            >
              <tab.icon size={14} />
              <span className="truncate w-full text-center px-1">{tab.label}</span>
              {activeTab === tab.id && <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-500 rounded-t-md" />}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-2">
          {activeTab === "queue" && (
            <QueuePanel
              queue={queue}
              isDark={isDark}
              onAddToQueue={handleAddToQueue}
              onRemoveFromQueue={handleRemoveFromQueue}
              onOpenCsvDialog={() => setShowCsvDialog(true)}
            />
          )}

          {activeTab === "templates" && (
            <TemplatesPanel
              folders={folders}
              isDark={isDark}
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
              hasApiKey={!!settings.apiKey}
              onUpdateSettings={handleUpdateSettings}
              onOpenApiKeyDialog={() => setShowApiKeyDialog(true)}
            />
          )}
        </div>

        {/* Footer Controls */}
        <div className={`p-2 border-t space-y-2 ${isDark ? "bg-black/80 border-white/10 backdrop-blur-xl" : "bg-slate-50 border-slate-200"}`}>
          <div className="flex gap-2">
            <button
              onClick={handleClearCompleted}
              className="flex-1 p-2 rounded-md border text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all border-white/10"
            >
              <Trash2 size={14} className="mx-auto" />
            </button>
            <button
              onClick={toggleProcessing}
              disabled={queue.length === 0}
              className={`flex-[4] p-2 rounded-md flex items-center justify-center gap-2 text-xs font-black uppercase shadow-xl transition-all active:scale-[0.98] ${
                isProcessing ? "bg-amber-500 shadow-amber-500/30" : "bg-blue-600 shadow-blue-600/30"
              } text-white disabled:opacity-30`}
            >
              {isProcessing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
              {isProcessing ? "Stop" : "Start"}
            </button>
          </div>

          {/* Results Preview */}
          {queue.filter((item) => item.status === QueueStatus.COMPLETED).length > 0 && (
            <div className="flex gap-1 overflow-x-auto no-scrollbar py-1">
              {queue
                .filter((item) => item.status === QueueStatus.COMPLETED)
                .slice(-5)
                .map((item) => {
                  const resultUrl = item.results?.flash?.url || item.results?.pro?.url;
                  return resultUrl ? (
                    <div key={item.id} className="relative group shrink-0">
                      <img src={resultUrl} className="w-12 h-12 rounded-md object-cover border border-white/10" alt="Result" />
                      <button
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = resultUrl;
                          link.download = `nano_flow_${item.id}.png`;
                          link.click();
                        }}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center rounded-md"
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
  matches: ["https://gemini.google.com/*"],
  runAt: "document_idle",
  cssInjectionMode: "ui",

  async main(ctx) {
    console.log("[Nano Flow] Content script with UI loaded on gemini.google.com");

    // Initialize automation module
    automationModule.init();

    // Create UI using shadow root for style isolation
    const ui = await createShadowRootUi(ctx, {
      name: "nano-flow-sidebar",
      position: "inline",
      anchor: "body",
      onMount: (container) => {
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

    console.log("[Nano Flow] Sidebar UI injected into page");
  },
});

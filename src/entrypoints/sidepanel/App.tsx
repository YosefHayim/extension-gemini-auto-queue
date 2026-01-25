import { useCallback, useEffect, useState } from "react";
import { Toaster } from "sonner";

import { CsvDialog } from "@/components/CsvDialog";
import { ExportDialog } from "@/components/ExportDialog";
import { Footer } from "@/components/Footer";
import { OnboardingModal } from "@/components/OnboardingModal";
import { QueuePanel } from "@/components/QueuePanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import { TemplatesPanel } from "@/components/TemplatesPanel";
import {
  DEFAULT_SETTINGS,
  getFolders,
  getQueue,
  getSettings,
  hasAnyAIKey,
  initializeQueueStorage,
  isOnboardingComplete,
  onQueueChange,
  onStorageChange,
  setOnboardingComplete,
} from "@/services/storageService";
import {
  MessageType,
  QueueStatus,
  STORAGE_KEYS,
  ThemeMode,
  type AppSettings,
  type ExtensionMessage,
  type ExtensionResponse,
  type Folder,
  type QueueItem,
} from "@/types";

import { ClearAllConfirm, FooterControls, Header, LoadingScreen, Navigation } from "./components";
import {
  useBulkModifyActions,
  useBulkResetActions,
  useChatMediaHandlers,
  useFolderHandlers,
  useProcessingHandlers,
  useQueueHandlers,
  useQueueItemHandlers,
  useSettingsHandlers,
} from "./hooks";

import type { TabType } from "./types";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [queue, setQueueState] = useState<QueueItem[]>([]);
  const [folders, setFoldersState] = useState<Folder[]>([]);
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("queue");
  const [activeTimer, setActiveTimer] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showCsvDialog, setShowCsvDialog] = useState(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  const [systemPrefersDark, setSystemPrefersDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const isDark =
    settings.theme === ThemeMode.SYSTEM ? systemPrefersDark : settings.theme === ThemeMode.DARK;

  useEffect(() => {
    const loadData = async () => {
      await initializeQueueStorage();
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
      setIsLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    const cleanupQueue = onQueueChange((queue) => {
      setQueueState(queue);
    });

    const cleanupStorage = onStorageChange((changes) => {
      if (STORAGE_KEYS.SETTINGS in changes) {
        setSettingsState(changes[STORAGE_KEYS.SETTINGS].newValue as AppSettings);
      }
      if (STORAGE_KEYS.FOLDERS in changes) {
        setFoldersState(changes[STORAGE_KEYS.FOLDERS].newValue as Folder[]);
      }
    });

    return () => {
      cleanupQueue();
      cleanupStorage();
    };
  }, []);

  useEffect(() => {
    const handleMessage = (message: ExtensionMessage) => {
      if (message.type === MessageType.PROCESS_QUEUE) {
        setIsProcessing(true);
        setIsPaused(false);
      } else if (message.type === MessageType.PAUSE_PROCESSING) {
        setIsProcessing(false);
        setIsPaused(true);
      } else if (message.type === MessageType.STOP_PROCESSING) {
        setIsProcessing(false);
        setIsPaused(false);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

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

  const sendMessage = useCallback(
    async <T,>(message: ExtensionMessage): Promise<ExtensionResponse<T>> => {
      return chrome.runtime.sendMessage(message);
    },
    []
  );

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

  const {
    handleAddToQueue,
    handleRemoveFromQueue,
    handleRetryQueueItem,
    handleReorderQueue,
    handleEditItem,
    handleUpdateItemImages,
  } = useQueueHandlers({
    queue,
    setQueueState,
    constructFinalPrompt,
    defaultTool: settings.defaultTool,
  });

  const { handleDuplicateItem, handleDuplicateWithAI, handleRunSingleItem, handleCsvUpload } =
    useQueueItemHandlers({
      queue,
      setQueueState,
      constructFinalPrompt,
      settings,
      sendMessage,
    });

  const {
    handleBulkAttachImages,
    handleBulkAIOptimize,
    handleBulkModify,
    handleBulkRemoveText,
    handleBulkRemoveFiles,
    handleBulkShuffle,
    handleBulkMoveToTop,
    handleBulkRetryFailed,
    handleBulkChangeTool,
    handleBulkChangeMode,
  } = useBulkModifyActions({
    queue,
    setQueueState,
    constructFinalPrompt,
    settings,
  });

  const { handleBulkReset, handleClearByFilter, handleClearCompleted, handleClearAll } =
    useBulkResetActions({
      queue,
      setQueueState,
    });

  const { handleScanChatMedia, handleDownloadChatMedia } = useChatMediaHandlers({ sendMessage });

  const { toggleProcessing } = useProcessingHandlers({
    isProcessing,
    isPaused,
    setIsProcessing,
    setIsPaused,
    sendMessage,
  });

  const { handleUpdateSettings } = useSettingsHandlers({
    settings,
    setSettingsState,
  });

  const {
    handleCreateFolder,
    handleDeleteFolder,
    handleToggleFolder,
    handleUseTemplate,
    handleDeleteTemplate,
    handleSaveTemplate,
    handleImproveTemplate,
    handleImproveFolder,
  } = useFolderHandlers({
    folders,
    setFoldersState,
    handleAddToQueue,
    setActiveTab,
  });

  const handleCompleteOnboarding = useCallback(async () => {
    await setOnboardingComplete(true);
    setShowOnboarding(false);
  }, []);

  const handleSwitchTab = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  const handleClearAllClick = useCallback(() => {
    setShowClearAllConfirm(true);
  }, []);

  const confirmClearAll = useCallback(async () => {
    await handleClearAll();
    setShowClearAllConfirm(false);
  }, [handleClearAll]);

  if (isLoading) {
    return <LoadingScreen isDark={isDark} />;
  }

  return (
    <div
      className={`flex h-screen w-full flex-col overflow-hidden transition-colors duration-500 ${
        isDark ? "bg-[#0a0a0a] text-white" : "bg-[#f8fafc] text-[#1e293b]"
      }`}
    >
      <Toaster
        position="top-center"
        theme={isDark ? "dark" : "light"}
        toastOptions={{
          className: "text-xs",
          duration: 3000,
        }}
      />

      {showOnboarding && (
        <OnboardingModal
          onComplete={() => {
            handleCompleteOnboarding().catch(() => {});
          }}
          isDark={isDark}
          onSwitchTab={handleSwitchTab}
        />
      )}

      <CsvDialog
        isOpen={showCsvDialog}
        isDark={isDark}
        onClose={() => setShowCsvDialog(false)}
        onUpload={(items) => {
          handleCsvUpload(items).catch(() => {});
        }}
      />

      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        queue={queue}
        isDark={isDark}
      />

      <Header
        isDark={isDark}
        isProcessing={isProcessing}
        activeTimer={activeTimer}
        completedCount={queue.filter((item) => item.status === QueueStatus.Completed).length}
        totalCount={queue.length}
      />

      <Navigation isDark={isDark} activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="no-scrollbar flex-1 overflow-y-auto p-3">
        {activeTab === "queue" && (
          <div data-onboarding="queue-panel">
            <QueuePanel
              queue={queue}
              isDark={isDark}
              defaultTool={settings.defaultTool}
              hasApiKey={hasAnyAIKey(settings)}
              onAddToQueue={handleAddToQueue}
              onRemoveFromQueue={handleRemoveFromQueue}
              onRetryQueueItem={handleRetryQueueItem}
              onClearAll={handleClearAllClick}
              onClearByFilter={handleClearByFilter}
              onRunSingleItem={handleRunSingleItem}
              onOpenCsvDialog={() => setShowCsvDialog(true)}
              onReorderQueue={handleReorderQueue}
              onDuplicateItem={handleDuplicateItem}
              onDuplicateWithAI={handleDuplicateWithAI}
              onEditItem={handleEditItem}
              onUpdateItemImages={handleUpdateItemImages}
              onBulkAttachImages={handleBulkAttachImages}
              onBulkAIOptimize={handleBulkAIOptimize}
              onBulkModify={handleBulkModify}
              onBulkReset={handleBulkReset}
              onBulkRemoveText={handleBulkRemoveText}
              onBulkRemoveFiles={handleBulkRemoveFiles}
              onScanChatMedia={handleScanChatMedia}
              onDownloadChatMedia={handleDownloadChatMedia}
              onClearCompleted={() => {
                handleClearCompleted().catch(() => {});
              }}
              onOpenExport={() => setShowExportDialog(true)}
              onBulkShuffle={handleBulkShuffle}
              onBulkMoveToTop={handleBulkMoveToTop}
              onBulkRetryFailed={handleBulkRetryFailed}
              onBulkChangeTool={handleBulkChangeTool}
              onBulkChangeMode={handleBulkChangeMode}
            />
          </div>
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

      {showClearAllConfirm && (
        <ClearAllConfirm
          isDark={isDark}
          itemCount={queue.length}
          onCancel={() => setShowClearAllConfirm(false)}
          onConfirm={() => {
            confirmClearAll().catch(() => {});
          }}
        />
      )}

      <FooterControls
        isDark={isDark}
        queue={queue}
        isProcessing={isProcessing}
        isPaused={isPaused}
        onToggleProcessing={() => {
          toggleProcessing().catch(() => {});
        }}
        activeTab={activeTab}
      />

      <Footer isDark={isDark} />
    </div>
  );
}

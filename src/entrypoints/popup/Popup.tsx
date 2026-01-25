import { ExternalLink, Linkedin, Mail, PanelRight, Settings, Zap } from "lucide-react";
import { useEffect, useState } from "react";

import { isExtensionEnabled } from "@/services/storageService";

function isGeminiSite(url: string | undefined): boolean {
  if (!url) return false;
  return url.includes("gemini.google.com") || url.includes("aistudio.google.com");
}

export default function Popup() {
  const [enabled, setEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOnGemini, setIsOnGemini] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        setIsOnGemini(isGeminiSite(tab?.url));

        const isEnabled = await isExtensionEnabled();
        setEnabled(isEnabled);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const openSidePanel = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        await chrome.sidePanel.setOptions({
          tabId: tab.id,
          path: "sidepanel.html",
          enabled: true,
        });
        await chrome.sidePanel.open({ tabId: tab.id });
        window.close();
      }
    } catch (error) {
      console.error("Failed to open side panel:", error);
    }
  };

  const openGemini = () => {
    window.open("https://gemini.google.com/", "_blank");
    window.close();
  };

  const openSettings = async () => {
    await chrome.runtime.openOptionsPage();
    window.close();
  };

  return (
    <div className="w-80 border border-border bg-background">
      <div className="flex flex-col gap-6 p-5">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Zap className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-[22px] font-bold text-foreground">Nano Flow</h1>
          <p className="text-center text-[13px] text-muted-foreground">
            Batch processing for Gemini
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {isOnGemini ? (
            <button
              onClick={openSidePanel}
              disabled={loading || !enabled}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              <PanelRight className="h-[18px] w-[18px]" />
              Open Side Panel
            </button>
          ) : (
            <button
              onClick={openGemini}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <ExternalLink className="h-[18px] w-[18px]" />
              Open Gemini
            </button>
          )}
          <button
            onClick={openSettings}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-secondary px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/80"
          >
            <Settings className="h-[18px] w-[18px]" />
            Settings
          </button>
        </div>

        <div className="h-px w-full bg-border" />

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground">Get in Touch</h2>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            Have ideas for new features or improvements?
          </p>
          <div className="flex flex-col gap-2">
            <a
              href="mailto:yosefisabag@gmail.com?subject=Gemini Nano Flow - Feedback"
              className="flex w-full items-center justify-between rounded-md bg-muted px-3 py-2.5 transition-colors hover:bg-muted/80"
            >
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-foreground" />
                <span className="text-[13px] font-medium text-foreground">
                  yosefisabag@gmail.com
                </span>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
            <a
              href="https://www.linkedin.com/in/yosef-hayim-sabag/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-between rounded-md bg-muted px-3 py-2.5 transition-colors hover:bg-muted/80"
            >
              <div className="flex items-center gap-2.5">
                <Linkedin className="h-4 w-4 text-foreground" />
                <span className="text-[13px] font-medium text-foreground">LinkedIn</span>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">Made by Yosef Hayim Sabag</p>
      </div>
    </div>
  );
}

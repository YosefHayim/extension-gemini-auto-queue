import { Key, X, ExternalLink, Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";

interface ApiKeyDialogProps {
  isOpen: boolean;
  isDark: boolean;
  currentKey?: string;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

export const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({
  isOpen,
  isDark,
  currentKey,
  onClose,
  onSave,
}) => {
  const [apiKey, setApiKey] = useState(currentKey ?? "");
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 p-2 backdrop-blur-md">
      <div
        className={`w-full max-w-md rounded-md border p-2 shadow-2xl ${
          isDark ? "glass-panel border-white/10" : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <Key size={18} className="text-blue-500" />
            <h2 className="text-sm font-black">API Key Configuration</h2>
          </div>
          <button onClick={onClose} className="rounded-md p-1 transition-all hover:bg-white/5">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-3 p-2">
          <div
            className={`rounded-md border p-2 text-[10px] leading-tight ${
              isDark ? "border-white/5 bg-white/5 opacity-70" : "border-slate-100 bg-slate-50"
            }`}
          >
            <p className="mb-2">
              Get your Gemini API key from Google AI Studio. Your key is stored locally and never
              sent to external servers.
            </p>
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-500 hover:underline"
            >
              Get API Key <ExternalLink size={10} />
            </a>
          </div>

          <div className="space-y-1">
            <label className="ml-1 text-[10px] font-black uppercase opacity-40">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                }}
                placeholder="AIzaSy..."
                className={`w-full rounded-md border p-2 pr-10 font-mono text-xs outline-none ${
                  isDark ? "border-white/10 bg-black/40" : "border-slate-200 bg-slate-50"
                }`}
              />
              <button
                type="button"
                onClick={() => {
                  setShowKey(!showKey);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-40 hover:opacity-100"
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className={`flex-1 rounded-md border p-2 text-xs font-black ${
                isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                handleSave().catch(() => {});
              }}
              disabled={!apiKey.trim()}
              className="flex-1 rounded-md bg-blue-600 p-2 text-xs font-black text-white shadow-lg hover:bg-blue-500 disabled:opacity-50"
            >
              Save Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyDialog;

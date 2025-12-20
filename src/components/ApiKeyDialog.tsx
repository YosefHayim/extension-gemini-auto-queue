import React, { useState } from 'react';
import { Key, X, ExternalLink, Eye, EyeOff } from 'lucide-react';

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
  onSave
}) => {
  const [apiKey, setApiKey] = useState(currentKey || '');
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/80 backdrop-blur-md p-2">
      <div
        className={`max-w-md w-full p-2 rounded-md border shadow-2xl ${
          isDark ? 'glass-panel border-white/10' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <Key size={18} className="text-blue-500" />
            <h2 className="text-sm font-black">API Key Configuration</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/5 rounded-md transition-all"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-2 space-y-3">
          <div
            className={`p-2 rounded-md border text-[10px] leading-tight ${
              isDark
                ? 'bg-white/5 border-white/5 opacity-70'
                : 'bg-slate-50 border-slate-100'
            }`}
          >
            <p className="mb-2">
              Get your Gemini API key from Google AI Studio. Your key is stored locally
              and never sent to external servers.
            </p>
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline flex items-center gap-1"
            >
              Get API Key <ExternalLink size={10} />
            </a>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase opacity-40 ml-1">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className={`w-full p-2 pr-10 rounded-md outline-none border font-mono text-xs ${
                  isDark ? 'bg-black/40 border-white/10' : 'bg-slate-50 border-slate-200'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-40 hover:opacity-100"
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className={`flex-1 p-2 rounded-md font-black text-xs border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className="flex-1 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-black text-xs shadow-lg disabled:opacity-50"
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


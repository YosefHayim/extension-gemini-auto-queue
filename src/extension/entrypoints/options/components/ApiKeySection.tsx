import { CheckCircle, ExternalLink, Eye, EyeOff, Key, RefreshCw, XCircle } from "lucide-react";

interface ApiKeySectionProps {
  isDark: boolean;
  apiKey: string;
  showApiKey: boolean;
  isValidating: boolean;
  validationResult: boolean | null;
  onApiKeyChange: (value: string) => void;
  onToggleShowKey: () => void;
  onValidate: () => void;
}

export function ApiKeySection({
  isDark: _isDark,
  apiKey,
  showApiKey,
  isValidating,
  validationResult,
  onApiKeyChange,
  onToggleShowKey,
  onValidate,
}: ApiKeySectionProps) {
  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Key size={20} className="text-blue-500" />
        <h2 className="text-lg font-bold">API Key Configuration</h2>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        Your Gemini API key is required for image generation. Get your key from Google AI Studio.
        The key is stored securely in your browser and never shared.
      </p>

      <a
        href="https://aistudio.google.com/apikey"
        target="_blank"
        rel="noopener noreferrer"
        className="mb-4 inline-flex items-center gap-1 text-sm text-blue-500 hover:underline"
      >
        Get API Key from AI Studio <ExternalLink size={14} />
      </a>

      <div className="space-y-4">
        <div className="relative">
          <input
            type={showApiKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => {
              onApiKeyChange(e.target.value);
            }}
            placeholder="AIzaSy..."
            className="w-full rounded-lg border border-border bg-background p-3 pr-24 font-mono text-sm text-foreground outline-none transition-all focus:border-blue-500"
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1">
            <button
              type="button"
              onClick={onToggleShowKey}
              className="p-2 opacity-40 transition-all hover:opacity-100"
            >
              {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button
              type="button"
              onClick={onValidate}
              disabled={!apiKey || isValidating}
              className={`rounded-md p-2 transition-all ${isValidating ? "opacity-50" : "opacity-40 hover:bg-blue-500/20 hover:opacity-100"}`}
            >
              <RefreshCw size={16} className={isValidating ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {validationResult !== null && (
          <div
            className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
              validationResult ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
            }`}
          >
            {validationResult ? (
              <>
                <CheckCircle size={16} /> API key is valid and working
              </>
            ) : (
              <>
                <XCircle size={16} /> API key validation failed. Please check your key.
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

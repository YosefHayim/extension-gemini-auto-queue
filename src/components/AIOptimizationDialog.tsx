import { CheckCircle, Sparkles, X, XCircle } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import type { QueueItem } from "@/types";

type OptimizationPersona = "creative" | "technical" | "punchy";

interface AIOptimizationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  hasApiKey: boolean;
  pendingCount: number;
  pendingItems: QueueItem[];
  onOptimize: (instructions: string, persona: string) => void;
}

const PERSONA_OPTIONS: { id: OptimizationPersona; label: string }[] = [
  { id: "creative", label: "Creative" },
  { id: "technical", label: "Technical" },
  { id: "punchy", label: "Short & Punchy" },
];

export const AIOptimizationDialog: React.FC<AIOptimizationDialogProps> = ({
  isOpen,
  onClose,
  hasApiKey,
  pendingCount,
  pendingItems,
  onOptimize,
}) => {
  const [selectedPersona, setSelectedPersona] = useState<OptimizationPersona>("creative");
  const [instructions, setInstructions] = useState("");

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleOptimize = () => {
    onOptimize(instructions, selectedPersona);
  };

  if (!isOpen) return null;

  const firstPendingPrompt =
    pendingItems[0]?.originalPrompt || "A serene mountain landscape at sunset";

  const getPersonaDescription = (persona: OptimizationPersona) => {
    switch (persona) {
      case "creative":
        return "rich atmospheric details";
      case "technical":
        return "precise technical parameters";
      case "punchy":
        return "punchy visual impact";
    }
  };

  const optimizedPreview = pendingItems[0]
    ? `${firstPendingPrompt.slice(0, 50)}... with ${getPersonaDescription(selectedPersona)}`
    : "Your optimized prompt will appear here with enhanced details and clarity";

  const isDisabled = !hasApiKey || pendingCount === 0;

  return (
    <div
      className="animate-in fade-in fixed inset-0 z-[1100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md duration-200"
      onClick={handleBackdropClick}
    >
      <div className="animate-in zoom-in-95 relative w-full max-w-[600px] rounded-2xl border border-slate-800 bg-[#0f172a] p-8 shadow-2xl duration-200">
        <button
          onClick={onClose}
          title="Close dialog"
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-500 transition-all hover:bg-slate-800 hover:text-slate-300"
        >
          <X size={18} />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 p-2">
            <Sparkles size={20} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">AI Prompt Optimization Flow</h2>
        </div>

        <div className="mb-8 flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">API Key:</span>
            <span className="font-mono text-sm text-slate-300">•••••••••</span>
          </div>
          {hasApiKey ? (
            <div className="flex items-center gap-1 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
              <CheckCircle size={12} />
              <span>Valid</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
              <XCircle size={12} />
              <span>Not configured</span>
            </div>
          )}
        </div>

        <div className="mb-8">
          <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-500">
            Before & After
          </label>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="mb-2 text-sm text-slate-500">Original</p>
              <p className="text-sm leading-relaxed text-slate-600">
                {firstPendingPrompt.length > 100
                  ? `${firstPendingPrompt.slice(0, 100)}...`
                  : firstPendingPrompt}
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm text-white">AI Optimized</p>
              <p className="text-sm leading-relaxed text-slate-300">
                {optimizedPreview.slice(0, 60)}
                <span className="text-green-400"> enhanced composition</span>
                {optimizedPreview.length > 60 && "..."}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8 flex items-center gap-4">
          <span className="text-xs text-slate-500">Optimization Persona</span>
          <div className="flex gap-2">
            {PERSONA_OPTIONS.map((persona) => (
              <button
                key={persona.id}
                onClick={() => setSelectedPersona(persona.id)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  selectedPersona === persona.id
                    ? "border-slate-600 bg-slate-700 font-medium text-white"
                    : "border-slate-700 text-slate-500 hover:border-slate-600"
                }`}
              >
                {persona.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
            Additional Instructions
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g., Make more detailed, add cinematic lighting, focus on composition..."
            className="min-h-[80px] w-full rounded-lg border border-slate-700 bg-slate-800/50 p-3 text-sm text-white transition-colors placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <button
          onClick={handleOptimize}
          disabled={isDisabled}
          title={
            !hasApiKey
              ? "Configure your API key first"
              : pendingCount === 0
                ? "No pending prompts to optimize"
                : `Optimize ${pendingCount} pending prompts`
          }
          className={`w-full rounded-xl py-3 font-semibold text-white transition-shadow ${
            isDisabled
              ? "cursor-not-allowed bg-slate-700 text-slate-400"
              : "bg-gradient-to-r from-blue-500 to-teal-400 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
          }`}
        >
          {pendingCount > 0
            ? `Optimize ${pendingCount} Pending Prompt${pendingCount > 1 ? "s" : ""}`
            : "Optimize All Pending Prompts"}
        </button>

        {isDisabled && (
          <p className="mt-3 text-center text-xs text-slate-500">
            {!hasApiKey
              ? "Please configure your API key in settings to use AI optimization"
              : "Add prompts to the queue to enable optimization"}
          </p>
        )}
      </div>
    </div>
  );
};

export default AIOptimizationDialog;

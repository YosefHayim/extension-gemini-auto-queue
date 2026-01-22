import { GeminiModel } from "@/types";

interface ModelSectionProps {
  isDark: boolean;
  primaryModel: GeminiModel;
  onModelChange: (model: GeminiModel) => void;
}

export function ModelSection({ isDark, primaryModel, onModelChange }: ModelSectionProps) {
  return (
    <div
      className={`mb-6 rounded-xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"}`}
    >
      <h2 className="mb-4 text-lg font-bold">Default Model</h2>
      <select
        value={primaryModel}
        onChange={(e) => {
          onModelChange(e.target.value as GeminiModel);
        }}
        className={`w-full appearance-none rounded-lg border p-3 text-sm font-bold outline-none transition-all ${
          isDark
            ? "border-white/10 bg-black/40 focus:border-blue-500/50"
            : "border-slate-200 bg-slate-50 focus:border-blue-500"
        }`}
      >
        <option value={GeminiModel.FLASH}>Flash 2.0 (High Speed)</option>
        <option value={GeminiModel.PRO}>Imagen 3 (High Fidelity)</option>
      </select>
    </div>
  );
}

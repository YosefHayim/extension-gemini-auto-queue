import { GeminiModel } from "@/types";

interface ModelSectionProps {
  isDark: boolean;
  primaryModel: GeminiModel;
  onModelChange: (model: GeminiModel) => void;
}

export function ModelSection({ isDark: _isDark, primaryModel, onModelChange }: ModelSectionProps) {
  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold">Default Model</h2>
      <select
        value={primaryModel}
        onChange={(e) => {
          onModelChange(e.target.value as GeminiModel);
        }}
        className="w-full appearance-none rounded-lg border border-border bg-background p-3 text-sm font-bold text-foreground outline-none transition-all focus:border-blue-500"
      >
        <option value={GeminiModel.FLASH}>Flash 2.0 (High Speed)</option>
        <option value={GeminiModel.PRO}>Imagen 3 (High Fidelity)</option>
      </select>
    </div>
  );
}

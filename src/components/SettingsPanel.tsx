import React from 'react';
import { Sun, Moon, Key } from 'lucide-react';
import { AppSettings, GeminiModel, ThemeMode } from '@/types';

interface SettingsPanelProps {
  settings: AppSettings;
  isDark: boolean;
  hasApiKey: boolean;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
  onOpenApiKeyDialog: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  isDark,
  hasApiKey,
  onUpdateSettings,
  onOpenApiKeyDialog
}) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* API Key Configuration */}
      <div
        className={`p-2 space-y-2 border rounded-md ${
          isDark ? 'border-white/5 bg-white/2' : 'border-slate-100 bg-slate-50'
        }`}
      >
        <div className="flex items-center justify-between px-1">
          <label className="text-[9px] font-black uppercase opacity-40 tracking-widest">
            API Key
          </label>
          <div className="flex items-center gap-2">
            <span
              className={`text-[9px] font-black uppercase ${
                hasApiKey ? 'text-emerald-500' : 'text-amber-500'
              }`}
            >
              {hasApiKey ? 'Configured' : 'Not Set'}
            </span>
            <button
              onClick={onOpenApiKeyDialog}
              className={`p-2 rounded-md transition-all flex items-center gap-2 text-[10px] font-black uppercase border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <Key size={12} className={hasApiKey ? 'text-emerald-500' : 'text-amber-500'} />
              {hasApiKey ? 'Update' : 'Configure'}
            </button>
          </div>
        </div>
      </div>

      {/* Theme Toggle */}
      <div
        className={`p-2 space-y-2 border rounded-md ${
          isDark ? 'border-white/5 bg-white/2' : 'border-slate-100 bg-slate-50'
        }`}
      >
        <div className="flex items-center justify-between px-1">
          <label className="text-[9px] font-black uppercase opacity-40 tracking-widest">
            Interface Theme
          </label>
          <button
            onClick={() =>
              onUpdateSettings({
                theme: isDark ? ThemeMode.LIGHT : ThemeMode.DARK
              })
            }
            className={`p-2 rounded-md transition-all flex items-center gap-2 text-[10px] font-black uppercase border ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
            }`}
          >
            {isDark ? (
              <Sun size={12} className="text-amber-400" />
            ) : (
              <Moon size={12} className="text-blue-500" />
            )}
            {isDark ? 'Switch to Light' : 'Switch to Dark'}
          </button>
        </div>
      </div>

      {/* Model Selection */}
      <div
        className={`p-2 space-y-2 border rounded-md ${
          isDark ? 'border-white/5 bg-white/2' : 'border-slate-100 bg-slate-50'
        }`}
      >
        <label className="text-[9px] font-black uppercase opacity-40 tracking-widest ml-1">
          Active Synthesis Model
        </label>
        <select
          value={settings.primaryModel}
          onChange={(e) => onUpdateSettings({ primaryModel: e.target.value as GeminiModel })}
          className={`w-full p-2 rounded-md border text-[10px] font-black uppercase transition-all appearance-none outline-none ${
            isDark
              ? 'bg-black/40 border-white/10 focus:border-blue-500/50'
              : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <option value={GeminiModel.FLASH}>Flash 2.0 (High Speed)</option>
          <option value={GeminiModel.PRO}>Imagen 3 (High Fidelity)</option>
        </select>
      </div>

      {/* Prefix/Suffix Settings */}
      <div
        className={`p-2 space-y-2 border rounded-md ${
          isDark ? 'border-white/5 bg-white/2' : 'border-slate-100 bg-slate-50'
        }`}
      >
        <label className="text-[9px] font-black uppercase opacity-40 tracking-widest ml-1">
          Global Prefix
        </label>
        <input
          value={settings.prefix}
          onChange={(e) => onUpdateSettings({ prefix: e.target.value })}
          placeholder="Text to prepend to all prompts..."
          className={`w-full p-2 rounded-md border text-xs outline-none ${
            isDark ? 'bg-black/40 border-white/10' : 'bg-white border-slate-200'
          }`}
        />
      </div>

      <div
        className={`p-2 space-y-2 border rounded-md ${
          isDark ? 'border-white/5 bg-white/2' : 'border-slate-100 bg-slate-50'
        }`}
      >
        <label className="text-[9px] font-black uppercase opacity-40 tracking-widest ml-1">
          Global Suffix
        </label>
        <input
          value={settings.suffix}
          onChange={(e) => onUpdateSettings({ suffix: e.target.value })}
          placeholder="Text to append to all prompts..."
          className={`w-full p-2 rounded-md border text-xs outline-none ${
            isDark ? 'bg-black/40 border-white/10' : 'bg-white border-slate-200'
          }`}
        />
      </div>

      {/* Global Negatives */}
      <div
        className={`p-2 space-y-2 border rounded-md ${
          isDark ? 'border-white/5 bg-white/2' : 'border-slate-100 bg-slate-50'
        }`}
      >
        <label className="text-[9px] font-black uppercase opacity-40 tracking-widest ml-1">
          Global Negative Prompts
        </label>
        <textarea
          value={settings.globalNegatives}
          onChange={(e) => onUpdateSettings({ globalNegatives: e.target.value })}
          placeholder="Things to avoid in all generations..."
          className={`w-full p-2 rounded-md border text-xs outline-none min-h-[60px] ${
            isDark ? 'bg-black/40 border-white/10' : 'bg-white border-slate-200'
          }`}
        />
      </div>

      {/* Drip Feed Toggle */}
      <div
        className={`p-2 space-y-2 border rounded-md ${
          isDark ? 'border-white/5 bg-white/2' : 'border-slate-100 bg-slate-50'
        }`}
      >
        <div className="flex items-center justify-between px-1">
          <div>
            <label className="text-[9px] font-black uppercase opacity-40 tracking-widest block">
              Drip Feed Mode
            </label>
            <p className="text-[8px] opacity-30 mt-1">Add random delays between generations</p>
          </div>
          <button
            onClick={() => onUpdateSettings({ dripFeed: !settings.dripFeed })}
            className={`w-10 h-5 rounded-full transition-all relative ${
              settings.dripFeed ? 'bg-blue-600' : 'bg-white/10'
            }`}
          >
            <div
              className={`absolute w-4 h-4 rounded-full bg-white top-0.5 transition-all shadow-md ${
                settings.dripFeed ? 'left-5' : 'left-0.5'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;


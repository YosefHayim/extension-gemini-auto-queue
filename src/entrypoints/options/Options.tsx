import {
  CheckCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Key,
  Moon,
  RefreshCw,
  Save,
  Sparkles,
  Sun,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import { validateApiKey } from "@/services/geminiService";
import { DEFAULT_SETTINGS, getSettings, setSettings } from "@/services/storageService";
import { GeminiModel, ThemeMode } from "@/types";

import type { AppSettings } from "@/types";

export default function Options() {
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const isDark = settings.theme === ThemeMode.DARK;

  useEffect(() => {
    const loadSettings = async () => {
      const savedSettings = await getSettings();
      setSettingsState(savedSettings);
      if (savedSettings.apiKey) {
        setApiKey(savedSettings.apiKey);
      }
    };
    loadSettings();
  }, []);

  const handleValidateKey = async () => {
    setIsValidating(true);
    setValidationResult(null);
    try {
      // Temporarily save the key for validation
      await setSettings({ ...settings, apiKey });
      const isValid = await validateApiKey();
      setValidationResult(isValid);
    } catch {
      setValidationResult(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedSettings = { ...settings, apiKey: apiKey || undefined };
      await setSettings(updatedSettings);
      setSettingsState(updatedSettings);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleThemeToggle = () => {
    setSettingsState((prev) => ({
      ...prev,
      theme: prev.theme === ThemeMode.DARK ? ThemeMode.LIGHT : ThemeMode.DARK,
    }));
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${isDark ? "bg-[#0a0a0a] text-white" : "bg-[#f8fafc] text-[#1e293b]"}`}
    >
      <div className="mx-auto max-w-2xl p-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-lg bg-blue-600 p-2 shadow-lg shadow-blue-600/20">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Gemini Nano Flow</h1>
            <p className="text-sm opacity-60">Extension Settings</p>
          </div>
          <button
            onClick={handleThemeToggle}
            className={`ml-auto rounded-lg p-2 transition-all ${isDark ? "bg-white/5 hover:bg-white/10" : "bg-slate-100 hover:bg-slate-200"}`}
          >
            {isDark ? (
              <Sun size={20} className="text-amber-400" />
            ) : (
              <Moon size={20} className="text-blue-500" />
            )}
          </button>
        </div>

        {/* API Key Section */}
        <div
          className={`mb-6 rounded-xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"}`}
        >
          <div className="mb-4 flex items-center gap-2">
            <Key size={20} className="text-blue-500" />
            <h2 className="text-lg font-bold">API Key Configuration</h2>
          </div>

          <p className={`mb-4 text-sm ${isDark ? "opacity-60" : "text-slate-600"}`}>
            Your Gemini API key is required for image generation. Get your key from Google AI
            Studio. The key is stored securely in your browser and never shared.
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
                  setApiKey(e.target.value);
                  setValidationResult(null);
                }}
                placeholder="AIzaSy..."
                className={`w-full rounded-lg border p-3 pr-24 font-mono text-sm outline-none transition-all ${
                  isDark
                    ? "border-white/10 bg-black/40 focus:border-blue-500/50"
                    : "border-slate-200 bg-slate-50 focus:border-blue-500"
                }`}
              />
              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowApiKey(!showApiKey);
                  }}
                  className="p-2 opacity-40 transition-all hover:opacity-100"
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  type="button"
                  onClick={handleValidateKey}
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
                  validationResult
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-red-500/10 text-red-500"
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

        {/* Model Selection */}
        <div
          className={`mb-6 rounded-xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"}`}
        >
          <h2 className="mb-4 text-lg font-bold">Default Model</h2>
          <select
            value={settings.primaryModel}
            onChange={(e) => {
              setSettingsState((prev) => ({
                ...prev,
                primaryModel: e.target.value as GeminiModel,
              }));
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

        {/* Prompt Settings */}
        <div
          className={`mb-6 rounded-xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"}`}
        >
          <h2 className="mb-4 text-lg font-bold">Default Prompt Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-bold opacity-60">Global Prefix</label>
              <input
                value={settings.prefix}
                onChange={(e) => {
                  setSettingsState((prev) => ({ ...prev, prefix: e.target.value }));
                }}
                placeholder="Text to prepend to all prompts..."
                className={`w-full rounded-lg border p-3 text-sm outline-none transition-all ${
                  isDark
                    ? "border-white/10 bg-black/40 focus:border-blue-500/50"
                    : "border-slate-200 bg-slate-50 focus:border-blue-500"
                }`}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold opacity-60">Global Suffix</label>
              <input
                value={settings.suffix}
                onChange={(e) => {
                  setSettingsState((prev) => ({ ...prev, suffix: e.target.value }));
                }}
                placeholder="Text to append to all prompts..."
                className={`w-full rounded-lg border p-3 text-sm outline-none transition-all ${
                  isDark
                    ? "border-white/10 bg-black/40 focus:border-blue-500/50"
                    : "border-slate-200 bg-slate-50 focus:border-blue-500"
                }`}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold opacity-60">Negative Prompts</label>
              <textarea
                value={settings.globalNegatives}
                onChange={(e) => {
                  setSettingsState((prev) => ({ ...prev, globalNegatives: e.target.value }));
                }}
                placeholder="Things to avoid in generations..."
                rows={3}
                className={`w-full resize-none rounded-lg border p-3 text-sm outline-none transition-all ${
                  isDark
                    ? "border-white/10 bg-black/40 focus:border-blue-500/50"
                    : "border-slate-200 bg-slate-50 focus:border-blue-500"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div
          className={`mb-6 rounded-xl border p-6 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white shadow-sm"}`}
        >
          <h2 className="mb-4 text-lg font-bold">Advanced Settings</h2>

          <div className="flex items-center justify-between border-b border-white/5 py-3">
            <div>
              <p className="font-bold">Drip Feed Mode</p>
              <p className="text-sm opacity-40">
                Add random delays between generations to avoid rate limiting
              </p>
            </div>
            <button
              onClick={() => {
                setSettingsState((prev) => ({ ...prev, dripFeed: !prev.dripFeed }));
              }}
              className={`relative h-6 w-12 rounded-full transition-all ${settings.dripFeed ? "bg-blue-600" : "bg-white/10"}`}
            >
              <div
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all ${settings.dripFeed ? "left-6" : "left-0.5"}`}
              />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex w-full items-center justify-center gap-2 rounded-xl p-4 font-black text-white transition-all ${
            saveSuccess
              ? "bg-emerald-600"
              : "bg-blue-600 shadow-lg shadow-blue-600/20 hover:bg-blue-500"
          }`}
        >
          {saveSuccess ? (
            <>
              <CheckCircle size={20} /> Settings Saved
            </>
          ) : (
            <>
              <Save size={20} /> Save Settings
            </>
          )}
        </button>

        {/* Footer */}
        <p className="mt-8 text-center text-sm opacity-40">
          Gemini Nano Flow v1.0.0 - Built with WXT
        </p>
      </div>
    </div>
  );
}

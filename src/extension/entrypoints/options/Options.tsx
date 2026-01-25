import { CheckCircle, Moon, Save, Sparkles, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { validateApiKey } from "@/backend/services/geminiService";
import { DEFAULT_SETTINGS, getSettings, setSettings } from "@/backend/services/storageService";
import { type GeminiModel, ThemeMode, type AppSettings } from "@/backend/types";
import {
  ApiKeySection,
  ModelSection,
  PromptSettingsSection,
  AdvancedSection,
} from "@/extension/entrypoints/options/components";

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
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

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
      const updatedSettings = { ...settings, apiKey: apiKey ?? undefined };
      await setSettings(updatedSettings);
      setSettingsState(updatedSettings);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    } catch {
      // Failed to save settings
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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <div className="mx-auto max-w-2xl p-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-lg bg-blue-600 p-2 shadow-lg shadow-blue-600/20">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Groove</h1>
            <p className="text-sm opacity-60">Extension Settings</p>
          </div>
          <button
            onClick={handleThemeToggle}
            className="ml-auto rounded-lg bg-secondary p-2 transition-all hover:bg-secondary/80"
          >
            {isDark ? (
              <Sun size={20} className="text-amber-400" />
            ) : (
              <Moon size={20} className="text-blue-500" />
            )}
          </button>
        </div>

        <ApiKeySection
          isDark={isDark}
          apiKey={apiKey}
          showApiKey={showApiKey}
          isValidating={isValidating}
          validationResult={validationResult}
          onApiKeyChange={(value) => {
            setApiKey(value);
            setValidationResult(null);
          }}
          onToggleShowKey={() => setShowApiKey(!showApiKey)}
          onValidate={() => {
            handleValidateKey().catch(() => {});
          }}
        />

        <ModelSection
          isDark={isDark}
          primaryModel={settings.primaryModel}
          onModelChange={(model: GeminiModel) => {
            setSettingsState((prev) => ({ ...prev, primaryModel: model }));
          }}
        />

        <PromptSettingsSection
          isDark={isDark}
          prefix={settings.prefix}
          suffix={settings.suffix}
          globalNegatives={settings.globalNegatives}
          onPrefixChange={(value) => setSettingsState((prev) => ({ ...prev, prefix: value }))}
          onSuffixChange={(value) => setSettingsState((prev) => ({ ...prev, suffix: value }))}
          onNegativesChange={(value) =>
            setSettingsState((prev) => ({ ...prev, globalNegatives: value }))
          }
        />

        <AdvancedSection
          isDark={isDark}
          dripFeed={settings.dripFeed}
          onDripFeedToggle={() => {
            setSettingsState((prev) => ({ ...prev, dripFeed: !prev.dripFeed }));
          }}
          analyticsEnabled={settings.analyticsEnabled}
          onAnalyticsToggle={() => {
            setSettingsState((prev) => ({ ...prev, analyticsEnabled: !prev.analyticsEnabled }));
          }}
        />

        <button
          onClick={() => {
            handleSave().catch(() => {});
          }}
          disabled={isSaving}
          className={`flex w-full items-center justify-center gap-2 rounded-xl p-4 font-black transition-all ${
            saveSuccess
              ? "bg-emerald-600 text-white"
              : "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
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

        <p className="mt-8 text-center text-sm opacity-40">Groove v2.1.0 - Built with WXT</p>
      </div>
    </div>
  );
}

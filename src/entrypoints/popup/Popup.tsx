import { Github, Heart, Linkedin, Power } from "lucide-react";
import React, { useEffect, useState } from "react";
import { isExtensionEnabled, setExtensionEnabled } from "@/services/storageService";

export default function Popup() {
  const [enabled, setEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load current enabled state
    isExtensionEnabled()
      .then((isEnabled) => {
        setEnabled(isEnabled);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleToggle = async () => {
    const newState = !enabled;
    try {
      await setExtensionEnabled(newState);
      setEnabled(newState);
    } catch (error) {
      console.error("Failed to update extension state:", error);
    }
  };

  return (
    <div className="w-80 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
            <Power className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold">Gemini Nano Flow</h1>
            <p className="text-xs text-gray-400">Bulk Image Generation</p>
          </div>
        </div>
      </div>

      {/* Toggle Section */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <Power className={`h-4 w-4 ${enabled ? "text-emerald-400" : "text-gray-500"}`} />
              <span className="text-sm font-medium">Extension Status</span>
            </div>
            <p className="text-xs text-gray-400">
              {enabled ? "Extension is active" : "Extension is disabled"}
            </p>
          </div>
          <button
            onClick={handleToggle}
            disabled={loading}
            className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${
              enabled ? "bg-emerald-500" : "bg-gray-600"
            } ${loading ? "opacity-50" : ""}`}
            role="switch"
            aria-checked={enabled}
            aria-label={enabled ? "Disable extension" : "Enable extension"}
          >
            <span
              className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white transition-transform duration-200 ${
                enabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 bg-white/5 px-4 py-3">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <span>Made with</span>
          <Heart className="h-3 w-3 fill-red-500 text-red-500" />
          <span>by</span>
          <span className="font-medium text-white">Yosef Hayim Sabag</span>
        </div>
        <div className="mt-2 flex items-center justify-center gap-3">
          <a
            href="https://github.com/YosefHayim"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="GitHub Profile"
          >
            <Github className="h-3.5 w-3.5" />
            <span>GitHub</span>
          </a>
          <a
            href="https://www.linkedin.com/in/yosef-hayim-sabag/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="LinkedIn Profile"
          >
            <Linkedin className="h-3.5 w-3.5" />
            <span>LinkedIn</span>
          </a>
        </div>
      </div>
    </div>
  );
}

import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";

import { initSentry, Sentry } from "@/backend/utils/sentry";
import App from "@/extension/entrypoints/sidepanel/App";
import { queryClient } from "@/extension/hooks";
import "@/extension/assets/styles.css";

initSentry({ context: "sidepanel", enableReplay: true, enableTracing: true });

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const SentryErrorFallback: Sentry.FallbackRender = ({ error, resetError }) => (
  <div className="flex h-screen flex-col items-center justify-center gap-4 bg-gray-900 p-8 text-white">
    <h1 className="text-xl font-bold text-red-400">Something went wrong</h1>
    <p className="text-sm text-gray-400">
      {error instanceof Error ? error.message : "An unexpected error occurred"}
    </p>
    <div className="flex gap-2">
      <button
        onClick={() => resetError()}
        className="rounded bg-gray-600 px-4 py-2 text-sm hover:bg-gray-700"
      >
        Try Again
      </button>
      <button
        onClick={() => window.location.reload()}
        className="rounded bg-blue-600 px-4 py-2 text-sm hover:bg-blue-700"
      >
        Reload Extension
      </button>
    </div>
  </div>
);

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={SentryErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);

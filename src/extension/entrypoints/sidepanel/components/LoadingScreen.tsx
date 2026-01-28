interface LoadingScreenProps {
  isDark: boolean;
}

export function LoadingScreen({ isDark: _isDark }: LoadingScreenProps) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-4">
        <img src="/icons/icon-32.png" alt="PromptQueue" className="h-12 w-12 animate-pulse" />
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
            style={{ animationDelay: "300ms" }}
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground">Loading...</span>
      </div>
    </div>
  );
}

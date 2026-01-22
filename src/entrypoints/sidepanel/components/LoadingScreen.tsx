interface LoadingScreenProps {
  isDark: boolean;
}

export function LoadingScreen({ isDark }: LoadingScreenProps) {
  return (
    <div
      className={`flex h-screen w-full flex-col items-center justify-center ${
        isDark ? "bg-[#0a0a0a] text-white" : "bg-[#f8fafc] text-[#1e293b]"
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <img src="/icons/icon-32.png" alt="Nano Flow" className="h-12 w-12 animate-pulse" />
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 animate-bounce rounded-full ${isDark ? "bg-blue-500" : "bg-blue-600"}`}
            style={{ animationDelay: "0ms" }}
          />
          <div
            className={`h-2 w-2 animate-bounce rounded-full ${isDark ? "bg-blue-500" : "bg-blue-600"}`}
            style={{ animationDelay: "150ms" }}
          />
          <div
            className={`h-2 w-2 animate-bounce rounded-full ${isDark ? "bg-blue-500" : "bg-blue-600"}`}
            style={{ animationDelay: "300ms" }}
          />
        </div>
        <span className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Loading...
        </span>
      </div>
    </div>
  );
}

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const queryKeys = {
  auth: ["auth"] as const,
  queue: ["queue"] as const,
  settings: ["settings"] as const,
  folders: ["folders"] as const,
  onboarding: ["onboarding"] as const,
};

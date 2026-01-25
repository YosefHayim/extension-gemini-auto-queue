import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  clearAuthUser,
  getAuthUser,
  setAuthUser,
  signIn,
  signOut,
} from "@/backend/services/authService";
import {
  getFolders,
  getQueue,
  getSettings,
  initializeQueueStorage,
  isOnboardingComplete,
  setFolders,
  setOnboardingComplete,
  setQueue,
  setSettings,
  updateQueueItem,
} from "@/backend/services/storageService";
import { queryKeys } from "@/extension/hooks/queryClient";

import type { AppSettings, AuthUser, Folder, QueueItem } from "@/backend/types";

export function useAuthQuery() {
  return useQuery({
    queryKey: queryKeys.auth,
    queryFn: getAuthUser,
  });
}

export function useSignInMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signIn,
    onSuccess: (result) => {
      if (result.success && result.user) {
        queryClient.setQueryData(queryKeys.auth, result.user);
      }
    },
  });
}

export function useSignOutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.auth, null);
    },
  });
}

export function useSetAuthUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user: AuthUser) => setAuthUser(user),
    onSuccess: (_, user) => {
      queryClient.setQueryData(queryKeys.auth, user);
    },
  });
}

export function useClearAuthUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearAuthUser,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.auth, null);
    },
  });
}

export function useQueueQuery() {
  return useQuery({
    queryKey: queryKeys.queue,
    queryFn: async () => {
      await initializeQueueStorage();
      return getQueue();
    },
  });
}

export function useSetQueueMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (queue: QueueItem[]) => setQueue(queue),
    onSuccess: (_, queue) => {
      queryClient.setQueryData(queryKeys.queue, queue);
    },
  });
}

export function useUpdateQueueItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<QueueItem> }) =>
      updateQueueItem(id, updates),
    onSuccess: (_, { id, updates }) => {
      queryClient.setQueryData<QueueItem[]>(queryKeys.queue, (old) => {
        if (!old) return old;
        return old.map((item) => (item.id === id ? { ...item, ...updates } : item));
      });
    },
  });
}

export function useSettingsQuery() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: getSettings,
  });
}

export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<AppSettings>) => setSettings(updates),
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.settings });
      const previous = queryClient.getQueryData<AppSettings>(queryKeys.settings);
      if (previous) {
        queryClient.setQueryData(queryKeys.settings, { ...previous, ...updates });
      }
      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.settings, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings });
    },
  });
}

export function useFoldersQuery() {
  return useQuery({
    queryKey: queryKeys.folders,
    queryFn: getFolders,
  });
}

export function useSetFoldersMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (folders: Folder[]) => setFolders(folders),
    onSuccess: (_, folders) => {
      queryClient.setQueryData(queryKeys.folders, folders);
    },
  });
}

export function useOnboardingQuery() {
  return useQuery({
    queryKey: queryKeys.onboarding,
    queryFn: isOnboardingComplete,
  });
}

export function useSetOnboardingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (complete: boolean) => setOnboardingComplete(complete),
    onSuccess: (_, complete) => {
      queryClient.setQueryData(queryKeys.onboarding, complete);
    },
  });
}

export function useAppData() {
  const authQuery = useAuthQuery();
  const queueQuery = useQueueQuery();
  const settingsQuery = useSettingsQuery();
  const foldersQuery = useFoldersQuery();
  const onboardingQuery = useOnboardingQuery();

  const isLoading =
    authQuery.isLoading ||
    queueQuery.isLoading ||
    settingsQuery.isLoading ||
    foldersQuery.isLoading ||
    onboardingQuery.isLoading;

  return {
    auth: authQuery,
    queue: queueQuery,
    settings: settingsQuery,
    folders: foldersQuery,
    onboarding: onboardingQuery,
    isLoading,
  };
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  clearAuthUser,
  getAuthUser,
  setAuthUser,
  signIn,
  signOut,
} from "@/backend/services/authService";
import { queryKeys } from "@/extension/hooks/queryClient";

import type { AuthUser } from "@/backend/types";

export function useAuthUser() {
  return useQuery({
    queryKey: queryKeys.auth,
    queryFn: getAuthUser,
  });
}

export function useSignIn() {
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

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.auth, null);
    },
  });
}

export function useSetAuthUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user: AuthUser) => setAuthUser(user),
    onSuccess: (_, user) => {
      queryClient.setQueryData(queryKeys.auth, user);
    },
  });
}

export function useClearAuthUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearAuthUser,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.auth, null);
    },
  });
}

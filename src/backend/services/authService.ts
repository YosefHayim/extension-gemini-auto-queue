import { STORAGE_KEYS, SubscriptionPlan } from "@/backend/types";
import { logger } from "@/backend/utils/logger";
import { getSettings } from "@/backend/services/storageService";

import type { AuthUser, UserUsage } from "@/backend/types";

const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
const API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:3000";

interface BackendAuthResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
      name: string;
      picture?: string;
      plan: string;
      status: string;
      usage: UserUsage;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
    isNewUser: boolean;
  };
  error?: string;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEYS.AUTH_USER);
    const user = result[STORAGE_KEYS.AUTH_USER] as AuthUser | undefined;

    if (!user) return null;

    if (user.expiresAt && Date.now() > user.expiresAt) {
      await clearAuthUser();
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export async function setAuthUser(user: AuthUser): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.AUTH_USER]: user });
}

export async function clearAuthUser(): Promise<void> {
  await chrome.storage.local.remove(STORAGE_KEYS.AUTH_USER);
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getAuthUser();
  return user !== null;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture?: string;
}

async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user info: ${response.status}`);
  }

  return response.json() as Promise<GoogleUserInfo>;
}

export async function signIn(): Promise<{ success: boolean; user?: AuthUser; error?: string; isNewUser?: boolean }> {
  try {
    logger.info("Auth", "signIn", "Starting Google sign-in");

    const token = await new Promise<string>((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!token) {
          reject(new Error("No token received"));
          return;
        }
        resolve(token);
      });
    });

    logger.debug("Auth", "signIn", "Got Google token, calling backend API");

    // Call backend API to register/login user
    const backendResponse = await fetch(`${API_URL}/api/v1/auth/google/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ accessToken: token }),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      logger.error("Auth", "signIn", "Backend API error", { status: backendResponse.status, error: errorText });
      throw new Error(`Backend authentication failed: ${backendResponse.status}`);
    }

    const backendData: BackendAuthResponse = await backendResponse.json();

    if (!backendData.success || !backendData.data) {
      logger.error("Auth", "signIn", "Backend returned error", { error: backendData.error });
      throw new Error(backendData.error || "Backend authentication failed");
    }

    const { user: backendUser, tokens, isNewUser } = backendData.data;

    logger.info("Auth", "signIn", "Backend auth successful", {
      userId: backendUser.id,
      plan: backendUser.plan,
      isNewUser
    });

    // Parse name into first/last name
    const nameParts = (backendUser.name || "").split(" ");
    const firstName = nameParts[0] || backendUser.email.split("@")[0];
    const lastName = nameParts.slice(1).join(" ") || "";

    const user: AuthUser = {
      id: backendUser.id,
      email: backendUser.email,
      firstName,
      lastName,
      avatarUrl: backendUser.picture,
      accessToken: token,
      expiresAt: Date.now() + 60 * 60 * 1000,
      plan: backendUser.plan as SubscriptionPlan,
      usage: backendUser.usage,
      backendAccessToken: tokens.accessToken,
      backendRefreshToken: tokens.refreshToken,
    };

    await setAuthUser(user);
    logger.info("Auth", "signIn", "User saved to storage");

    // Sync local data (settings, country, etc.) to backend
    // Do this async, don't block sign-in
    syncLocalDataToBackend().catch((err) => {
      logger.warn("Auth", "signIn", "Failed to sync local data to backend", { error: err });
    });

    return { success: true, user, isNewUser };
  } catch (err) {
    logger.error("Auth", "signIn", "Sign-in failed", { error: err instanceof Error ? err.message : err });
    return {
      success: false,
      error: err instanceof Error ? err.message : "Authentication failed",
    };
  }
}

export async function signOut(): Promise<void> {
  const user = await getAuthUser();

  if (user?.accessToken) {
    await new Promise<void>((resolve) => {
      chrome.identity.removeCachedAuthToken({ token: user.accessToken }, () => {
        resolve();
      });
    });
  }

  await clearAuthUser();
}

export async function refreshToken(): Promise<boolean> {
  try {
    const token = await new Promise<string>((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: false }, (token) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!token) {
          reject(new Error("No token received"));
          return;
        }
        resolve(token);
      });
    });

    const currentUser = await getAuthUser();
    if (currentUser) {
      currentUser.accessToken = token;
      currentUser.expiresAt = Date.now() + 60 * 60 * 1000;
      await setAuthUser(currentUser);
    }

    return true;
  } catch {
    return false;
  }
}

export function getUserInitials(user: AuthUser): string {
  const firstInitial = user.firstName.charAt(0).toUpperCase();
  const lastInitial = user.lastName.charAt(0).toUpperCase();
  return `${firstInitial}${lastInitial}` || user.email.charAt(0).toUpperCase();
}

/**
 * Sync user data from backend (get latest plan, usage, etc.)
 */
export async function syncUserFromBackend(): Promise<AuthUser | null> {
  try {
    const currentUser = await getAuthUser();
    if (!currentUser?.backendAccessToken) {
      logger.warn("Auth", "syncUserFromBackend", "No backend token available");
      return null;
    }

    const response = await fetch(`${API_URL}/api/v1/user/me`, {
      headers: {
        Authorization: `Bearer ${currentUser.backendAccessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try to refresh
        const refreshed = await refreshBackendToken();
        if (!refreshed) {
          logger.warn("Auth", "syncUserFromBackend", "Token refresh failed");
          return null;
        }
        return syncUserFromBackend();
      }
      throw new Error(`Failed to sync user: ${response.status}`);
    }

    const data = await response.json();
    if (data.success && data.data) {
      const backendUser = data.data;

      currentUser.plan = backendUser.plan as SubscriptionPlan;
      currentUser.usage = backendUser.usage;

      await setAuthUser(currentUser);
      logger.info("Auth", "syncUserFromBackend", "User synced", { plan: currentUser.plan });

      return currentUser;
    }

    return null;
  } catch (err) {
    logger.error("Auth", "syncUserFromBackend", "Sync failed", { error: err });
    return null;
  }
}

/**
 * Refresh the backend JWT token
 */
export async function refreshBackendToken(): Promise<boolean> {
  try {
    const currentUser = await getAuthUser();
    if (!currentUser?.backendRefreshToken) {
      return false;
    }

    const response = await fetch(`${API_URL}/api/v1/auth/tokens/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken: currentUser.backendRefreshToken }),
    });

    if (!response.ok) {
      logger.error("Auth", "refreshBackendToken", "Refresh failed", { status: response.status });
      return false;
    }

    const data = await response.json();
    if (data.success && data.data?.tokens) {
      currentUser.backendAccessToken = data.data.tokens.accessToken;
      currentUser.backendRefreshToken = data.data.tokens.refreshToken;
      await setAuthUser(currentUser);
      logger.info("Auth", "refreshBackendToken", "Token refreshed");
      return true;
    }

    return false;
  } catch (err) {
    logger.error("Auth", "refreshBackendToken", "Error", { error: err });
    return false;
  }
}

/**
 * Track a prompt usage event
 */
export async function trackPromptUsage(data: {
  model: string;
  promptLength: number;
  hasImages: boolean;
  tool?: string;
}): Promise<void> {
  try {
    const currentUser = await getAuthUser();
    if (!currentUser?.backendAccessToken) return;

    await fetch(`${API_URL}/api/v1/user/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentUser.backendAccessToken}`,
      },
      body: JSON.stringify({
        event: "prompt_used",
        properties: data,
      }),
    });
  } catch (err) {
    logger.debug("Auth", "trackPromptUsage", "Tracking failed (non-critical)", { error: err });
  }
}

/**
 * Get user's country from timezone/locale
 */
function detectUserCountry(): string {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const locale = navigator.language || "en-US";
    const country = locale.split("-")[1] || timezone.split("/")[0];
    return country;
  } catch {
    return "unknown";
  }
}

/**
 * Sync local user data to backend (settings, preferences, country, etc.)
 * Call this after sign-in to update the user profile in the database
 */
export async function syncLocalDataToBackend(): Promise<boolean> {
  try {
    const currentUser = await getAuthUser();
    if (!currentUser?.backendAccessToken) {
      logger.warn("Auth", "syncLocalDataToBackend", "No backend token available");
      return false;
    }

    // Get local settings
    const settings = await getSettings();

    // Prepare user profile data from local storage
    const profileData = {
      // User preferences from extension settings
      preferences: {
        theme: settings.theme,
        primaryModel: settings.primaryModel,
        defaultTool: settings.defaultTool,
        dripFeed: settings.dripFeed,
        dripFeedDelay: settings.dripFeedDelay,
        autoStopOnError: settings.autoStopOnError,
        analyticsEnabled: settings.analyticsEnabled,
        sidebarWidth: settings.sidebarWidth,
        preferredAIProvider: settings.preferredAIProvider,
      },
      // Device/environment info
      metadata: {
        country: detectUserCountry(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform,
        extensionVersion: chrome.runtime.getManifest().version,
        userAgent: navigator.userAgent,
      },
    };

    logger.debug("Auth", "syncLocalDataToBackend", "Syncing local data to backend", profileData);

    const response = await fetch(`${API_URL}/api/v1/user/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentUser.backendAccessToken}`,
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        const refreshed = await refreshBackendToken();
        if (refreshed) {
          return syncLocalDataToBackend();
        }
      }
      logger.error("Auth", "syncLocalDataToBackend", "Sync failed", { status: response.status });
      return false;
    }

    logger.info("Auth", "syncLocalDataToBackend", "Local data synced to backend");
    return true;
  } catch (err) {
    logger.error("Auth", "syncLocalDataToBackend", "Error syncing local data", { error: err });
    return false;
  }
}

/**
 * Full sync: get user from local storage and sync to backend
 * Call this on extension startup or when user data changes
 */
export async function fullUserSync(): Promise<AuthUser | null> {
  try {
    const currentUser = await getAuthUser();
    if (!currentUser) {
      logger.debug("Auth", "fullUserSync", "No user logged in");
      return null;
    }

    // First sync local data to backend
    await syncLocalDataToBackend();

    // Then get latest data from backend
    const updatedUser = await syncUserFromBackend();

    return updatedUser || currentUser;
  } catch (err) {
    logger.error("Auth", "fullUserSync", "Full sync failed", { error: err });
    return null;
  }
}

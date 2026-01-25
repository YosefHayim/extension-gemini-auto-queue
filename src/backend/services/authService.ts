import { STORAGE_KEYS } from "@/backend/types";

import type { AuthUser } from "@/backend/types";

const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

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

export async function signIn(): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
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

    const userInfo = await fetchGoogleUserInfo(token);

    const user: AuthUser = {
      id: userInfo.sub,
      email: userInfo.email,
      firstName: userInfo.given_name,
      lastName: userInfo.family_name,
      avatarUrl: userInfo.picture,
      accessToken: token,
      refreshToken: undefined,
      expiresAt: Date.now() + 60 * 60 * 1000,
    };

    await setAuthUser(user);
    return { success: true, user };
  } catch (err) {
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

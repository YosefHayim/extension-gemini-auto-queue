import type { AuthUser } from "@/backend/types";
import { STORAGE_KEYS } from "@/backend/types";

const OAUTH_CONFIG = {
  clientId: "",
  redirectUri: "",
  authEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "",
  scope: "email profile openid",
};

const isDevelopment: boolean = import.meta.env.DEV || false;

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

function generateDevUser(): AuthUser {
  return {
    id: "dev-user-123",
    email: "developer@nanoflow.dev",
    firstName: "Dev",
    lastName: "User",
    avatarUrl: undefined,
    accessToken: "dev-access-token",
    refreshToken: "dev-refresh-token",
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };
}

export async function signIn(): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  if (isDevelopment) {
    const devUser = generateDevUser();
    await setAuthUser(devUser);
    return { success: true, user: devUser };
  }

  try {
    const state = crypto.randomUUID();
    const nonce = crypto.randomUUID();

    await chrome.storage.session.set({ oauth_state: state, oauth_nonce: nonce });

    const params = new URLSearchParams({
      client_id: OAUTH_CONFIG.clientId,
      redirect_uri: OAUTH_CONFIG.redirectUri,
      response_type: "code",
      scope: OAUTH_CONFIG.scope,
      state,
      nonce,
      access_type: "offline",
      prompt: "consent",
    });

    const authUrl = `${OAUTH_CONFIG.authEndpoint}?${params.toString()}`;

    return await new Promise((resolve) => {
      chrome.identity.launchWebAuthFlow(
        {
          url: authUrl,
          interactive: true,
        },
        async (redirectUrl) => {
          if (chrome.runtime.lastError ?? !redirectUrl) {
            resolve({
              success: false,
              error: chrome.runtime.lastError?.message ?? "Authentication cancelled",
            });
            return;
          }

          try {
            const url = new URL(redirectUrl);
            const code = url.searchParams.get("code");
            const returnedState = url.searchParams.get("state");

            const sessionData = await chrome.storage.session.get(["oauth_state"]);
            if (returnedState !== sessionData.oauth_state) {
              resolve({ success: false, error: "Invalid state parameter" });
              return;
            }

            const tokenResponse = await fetch(OAUTH_CONFIG.tokenEndpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code, redirectUri: OAUTH_CONFIG.redirectUri }),
            });

            if (!tokenResponse.ok) {
              resolve({ success: false, error: "Failed to exchange authorization code" });
              return;
            }

            const tokenData = (await tokenResponse.json()) as {
              user: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
                picture?: string;
              };
              accessToken: string;
              refreshToken?: string;
              expiresIn: number;
            };

            const user: AuthUser = {
              id: tokenData.user.id,
              email: tokenData.user.email,
              firstName: tokenData.user.firstName,
              lastName: tokenData.user.lastName,
              avatarUrl: tokenData.user.picture,
              accessToken: tokenData.accessToken,
              refreshToken: tokenData.refreshToken,
              expiresAt: Date.now() + tokenData.expiresIn * 1000,
            };

            await setAuthUser(user);
            await chrome.storage.session.remove(["oauth_state", "oauth_nonce"]);

            resolve({ success: true, user });
          } catch (err) {
            resolve({
              success: false,
              error: err instanceof Error ? err.message : "Unknown error",
            });
          }
        }
      );
    });
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function signOut(): Promise<void> {
  await clearAuthUser();
}

export function getUserInitials(user: AuthUser): string {
  const firstInitial = user.firstName.charAt(0).toUpperCase();
  const lastInitial = user.lastName.charAt(0).toUpperCase();
  return `${firstInitial}${lastInitial}` || user.email.charAt(0).toUpperCase();
}

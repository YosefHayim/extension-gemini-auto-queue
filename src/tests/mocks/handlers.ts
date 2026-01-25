import { http, HttpResponse } from "msw";

const API_BASE = "http://localhost:3000/api/v1";

interface MockUser {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  plan: "free" | "lifetime";
  status: "active" | "expired";
  isEmailVerified: boolean;
  usage: {
    promptsToday: number;
    lastResetAt: string;
  };
}

interface SubscriptionInfo {
  plan: "free" | "lifetime";
  status: string;
  dailyLimit: number;
  promptsUsedToday: number;
  promptsRemaining: number;
  isLifetime: boolean;
  purchasedAt: string | null;
  lemonSqueezyOrderId: string | null;
}

const mockUser: MockUser = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  picture: null,
  plan: "free",
  status: "active",
  isEmailVerified: true,
  usage: {
    promptsToday: 0,
    lastResetAt: new Date().toISOString(),
  },
};

const mockSubscription: SubscriptionInfo = {
  plan: "free",
  status: "active",
  dailyLimit: 10,
  promptsUsedToday: 0,
  promptsRemaining: 10,
  isLifetime: false,
  purchasedAt: null,
  lemonSqueezyOrderId: null,
};

export const handlers = [
  http.post(`${API_BASE}/auth/otp/request`, async ({ request }) => {
    const body = (await request.json()) as { email?: string };

    if (!body.email?.includes("@")) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: "INVALID_EMAIL", message: "Invalid email address" },
        },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: { message: "OTP sent successfully" },
    });
  }),

  http.post(`${API_BASE}/auth/otp/verify`, async ({ request }) => {
    const body = (await request.json()) as { email: string; code: string };

    if (body.code !== "123456") {
      return HttpResponse.json(
        {
          success: false,
          error: { code: "INVALID_OTP", message: "Invalid or expired OTP" },
        },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        user: mockUser,
      },
    });
  }),

  http.post(`${API_BASE}/auth/google/token`, async ({ request }) => {
    const body = (await request.json()) as { token: string };

    if (!body.token) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: "INVALID_TOKEN", message: "Missing Google token" },
        },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        user: { ...mockUser, googleId: "google-123" },
      },
    });
  }),

  http.post(`${API_BASE}/auth/refresh`, async ({ request }) => {
    const body = (await request.json()) as { refreshToken: string };

    if (!body.refreshToken) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: "INVALID_TOKEN", message: "Missing refresh token" },
        },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        accessToken: "new-mock-access-token",
        refreshToken: "new-mock-refresh-token",
      },
    });
  }),

  http.post(`${API_BASE}/auth/logout`, () => {
    return HttpResponse.json({
      success: true,
      data: { message: "Logged out successfully" },
    });
  }),

  http.get(`${API_BASE}/users/me`, ({ request }) => {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Missing authorization header" },
        },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: { user: mockUser, subscription: mockSubscription },
    });
  }),

  http.patch(`${API_BASE}/users/me`, async ({ request }) => {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Missing authorization header" },
        },
        { status: 401 }
      );
    }

    const updates = (await request.json()) as Partial<MockUser>;
    const updatedUser = { ...mockUser, ...updates };

    return HttpResponse.json({
      success: true,
      data: { user: updatedUser },
    });
  }),

  http.delete(`${API_BASE}/users/me`, ({ request }) => {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Missing authorization header" },
        },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: { message: "Account deleted successfully" },
    });
  }),

  http.post(`${API_BASE}/users/features/consume`, async ({ request }) => {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Missing authorization header" },
        },
        { status: 401 }
      );
    }

    const body = (await request.json()) as { feature: string };

    if (mockSubscription.promptsRemaining <= 0) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: "LIMIT_EXCEEDED", message: "Daily prompt limit reached" },
        },
        { status: 403 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        consumed: true,
        feature: body.feature,
        remaining: mockSubscription.promptsRemaining - 1,
      },
    });
  }),

  http.get(`${API_BASE}/subscriptions`, ({ request }) => {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Missing authorization header" },
        },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: mockSubscription,
    });
  }),

  http.get(`${API_BASE}/subscriptions/checkout/lifetime`, ({ request }) => {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Missing authorization header" },
        },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        checkoutUrl: "https://checkout.lemonsqueezy.com/test-checkout",
      },
    });
  }),

  http.get(`${API_BASE}/subscriptions/plans`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        plans: [
          {
            id: "free",
            name: "Free",
            price: 0,
            dailyPrompts: 10,
            features: ["10 prompts per day", "Basic tools"],
          },
          {
            id: "lifetime",
            name: "Lifetime",
            price: 5,
            dailyPrompts: 100,
            features: ["100 prompts per day", "All tools", "Priority support"],
          },
        ],
      },
    });
  }),

  http.post(`${API_BASE}/subscriptions/webhook`, () => {
    return HttpResponse.json({ received: true });
  }),

  http.get("/health", () => {
    return HttpResponse.json({ status: "ok" });
  }),

  http.get("/health/ready", () => {
    return HttpResponse.json({ status: "ready", database: "connected", redis: "connected" });
  }),

  http.get("/health/live", () => {
    return HttpResponse.json({ status: "live" });
  }),
];

export function createMockUserWithPlan(plan: "free" | "lifetime"): MockUser {
  return {
    ...mockUser,
    plan,
  };
}

export function createMockSubscriptionWithPlan(plan: "free" | "lifetime"): SubscriptionInfo {
  return {
    ...mockSubscription,
    plan,
    dailyLimit: plan === "lifetime" ? 100 : 10,
    promptsRemaining: plan === "lifetime" ? 100 : 10,
    isLifetime: plan === "lifetime",
  };
}

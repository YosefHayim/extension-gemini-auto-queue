import type { FastifyRequest, FastifyReply } from "fastify";

export interface JWTPayload {
  userId: string;
  email: string;
  type: "access" | "refresh";
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends FastifyRequest {
  user: {
    userId: string;
    email: string;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface OTPData {
  code: string;
  email: string;
  attempts: number;
  createdAt: Date;
  expiresAt: Date;
}

export interface LemonSqueezyWebhookPayload {
  meta: {
    event_name: string;
    custom_data?: Record<string, unknown>;
    test_mode: boolean;
  };
  data: {
    id: string;
    type: string;
    attributes: LemonSqueezySubscriptionAttributes;
    relationships?: Record<string, unknown>;
  };
}

export interface LemonSqueezySubscriptionAttributes {
  store_id: number;
  customer_id: number;
  order_id: number;
  order_item_id: number;
  product_id: number;
  variant_id: number;
  product_name: string;
  variant_name: string;
  user_name: string;
  user_email: string;
  status: string;
  status_formatted: string;
  card_brand: string | null;
  card_last_four: string | null;
  pause: unknown | null;
  cancelled: boolean;
  trial_ends_at: string | null;
  billing_anchor: number;
  first_subscription_item: {
    id: number;
    subscription_id: number;
    price_id: number;
    quantity: number;
    created_at: string;
    updated_at: string;
  } | null;
  urls: {
    update_payment_method: string;
    customer_portal: string;
  };
  renews_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
  test_mode: boolean;
}

export interface UserSubscriptionInfo {
  plan: "free" | "lifetime";
  status: string;
  dailyLimit: number;
  promptsUsedToday: number;
  promptsRemaining: number;
  isLifetime: boolean;
  purchasedAt: Date | null;
  lemonSqueezyOrderId: string | null;
}

export interface FeatureAccess {
  allowed: boolean;
  reason?: string;
  creditsRequired?: number;
  creditsRemaining?: number;
}

export type RouteHandler<T = unknown> = (
  request: FastifyRequest,
  reply: FastifyReply
) => Promise<ApiResponse<T>>;

export type AuthRouteHandler<T = unknown> = (
  request: AuthenticatedRequest,
  reply: FastifyReply
) => Promise<ApiResponse<T>>;

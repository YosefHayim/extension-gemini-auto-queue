# Groove Backend

Production-ready Node.js/TypeScript backend for the Groove Chrome Extension.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Chrome Extension                              │
└─────────────────────────────┬───────────────────────────────────────┘
                              │ HTTPS + JWT
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API Gateway (Fastify)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Auth Routes  │  │ User Routes  │  │ Subscription Routes      │  │
│  │ /auth/*      │  │ /users/*     │  │ /subscriptions/*         │  │
│  └──────┬───────┘  └──────┬───────┘  └────────────┬─────────────┘  │
└─────────┼─────────────────┼────────────────────────┼────────────────┘
          │                 │                        │
          ▼                 ▼                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Service Layer                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ AuthService  │  │ UserService  │  │ SubscriptionService      │  │
│  │ TokenService │  │              │  │ (Lemon Squeezy)          │  │
│  │ OTPService   │  │              │  │                          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
   ┌────────────┐      ┌────────────┐      ┌────────────┐
   │  MongoDB   │      │   Redis    │      │ Lemon      │
   │  (Users)   │      │ (Sessions) │      │ Squeezy    │
   └────────────┘      └────────────┘      └────────────┘
```

## Features

- **Authentication**: Google OAuth 2.0 + Email OTP with JWT tokens
- **Subscription Management**: Lemon Squeezy integration (webhooks as single source of truth)
- **Feature Gating**: Credit-based system for free tier, unlimited for paid
- **Monitoring**: Sentry error tracking + PostHog analytics
- **Rate Limiting**: Configurable per-route rate limits
- **Security**: Helmet, CORS, JWT refresh token rotation

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm
- MongoDB
- Redis

### Development

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your values

# Start with Docker (MongoDB + Redis)
docker-compose up -d mongo redis

# Run development server
pnpm dev
```

### Production Build

```bash
pnpm build
pnpm start
```

### Docker

```bash
# Build and run all services
docker-compose up --build

# Or build image only
docker build -t gemini-nano-flow-backend .
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/otp/request` | Request OTP email |
| POST | `/api/v1/auth/otp/verify` | Verify OTP and login |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout (revoke refresh token) |
| GET | `/api/v1/auth/google` | Initiate Google OAuth |
| GET | `/api/v1/auth/google/callback` | Google OAuth callback |

### User

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/me` | Get current user profile |
| PATCH | `/api/v1/users/me` | Update profile |
| DELETE | `/api/v1/users/me` | Delete account |
| POST | `/api/v1/users/features/check` | Check feature access |
| POST | `/api/v1/users/features/consume` | Consume credits for feature |

### Subscription

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/subscriptions` | Get subscription info |
| POST | `/api/v1/subscriptions/sync` | Sync from Lemon Squeezy |
| POST | `/api/v1/subscriptions/cancel` | Cancel subscription |
| GET | `/api/v1/subscriptions/checkout/:plan` | Get checkout URL |
| POST | `/api/v1/subscriptions/webhook` | Lemon Squeezy webhook |
| GET | `/api/v1/subscriptions/plans` | List available plans |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Basic health check |
| GET | `/health/ready` | Readiness check (DB + Redis) |
| GET | `/health/live` | Liveness check |

## Pricing Model

| Plan | Price | Credits | Features |
|------|-------|---------|----------|
| Free | $0 | 100 | Basic queue, limited tools |
| Monthly | $2/mo | Unlimited | All features |
| Annual | $16/yr | Unlimited | All features + early access |

## Environment Variables

See `.env.example` for all required variables.

### Required

- `JWT_SECRET` - JWT signing key (32+ chars)
- `JWT_REFRESH_SECRET` - Refresh token signing key
- `MONGODB_URI` - MongoDB connection string
- `REDIS_URL` - Redis connection string
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `LEMON_SQUEEZY_API_KEY` - Lemon Squeezy API key
- `LEMON_SQUEEZY_WEBHOOK_SECRET` - Webhook signature verification
- `AWS_ACCESS_KEY_ID` - AWS SES credentials
- `AWS_SECRET_ACCESS_KEY` - AWS SES credentials

## AWS App Runner Deployment

1. Push to repository
2. Create App Runner service from source
3. Set environment variables in App Runner console
4. Configure custom domain (optional)

The `apprunner.yaml` file configures the build and runtime settings.

## Database Schema

### User

```typescript
{
  email: string,
  name: string | null,
  picture: string | null,
  googleId: string | null,
  isEmailVerified: boolean,
  subscription: {
    plan: "free" | "monthly" | "annual",
    status: "active" | "cancelled" | "expired" | ...,
    lemonSqueezyCustomerId: string | null,
    lemonSqueezySubscriptionId: string | null,
    currentPeriodEnd: Date | null,
    cancelAtPeriodEnd: boolean,
    customerPortalUrl: string | null,
    updatePaymentUrl: string | null,
  },
  credits: {
    total: number,
    used: number,
    lastResetAt: Date,
  },
  metadata: {
    lastLoginAt: Date | null,
    loginCount: number,
    createdFrom: "google" | "email",
  }
}
```

## Feature Credit Costs

| Feature | Credits |
|---------|---------|
| Queue Processing | 1 |
| Image Generation | 2 |
| Video Generation | 5 |
| Deep Research | 3 |
| Canvas | 1 |
| Scheduling | 1 |
| Bulk Actions | 0 (free) |
| Templates | 0 (free) |
| Export | 0 (free) |

## License

Private - All rights reserved

import mongoose, { Schema, Document, Model } from "mongoose";
import { SUBSCRIPTION_PLANS, SUBSCRIPTION_STATUS } from "../constants/index.js";

export interface IUserMethods {
  hasActiveSubscription(): boolean;
  getRemainingCredits(): number;
  canUseFeature(creditCost: number): boolean;
  consumeCredits(amount: number): Promise<void>;
  resetCredits(): Promise<void>;
}

export interface IUser extends Document, IUserMethods {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string | null;
  picture: string | null;
  googleId: string | null;
  isEmailVerified: boolean;
  subscription: {
    plan: (typeof SUBSCRIPTION_PLANS)[keyof typeof SUBSCRIPTION_PLANS];
    status: (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];
    lemonSqueezyCustomerId: string | null;
    lemonSqueezySubscriptionId: string | null;
    variantId: string | null;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
    customerPortalUrl: string | null;
    updatePaymentUrl: string | null;
  };
  credits: {
    total: number;
    used: number;
    lastResetAt: Date;
  };
  metadata: {
    lastLoginAt: Date | null;
    loginCount: number;
    createdFrom: "google" | "email";
    ipAddress: string | null;
    userAgent: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type UserModel = Model<IUser, object, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      default: null,
      trim: true,
    },
    picture: {
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
      sparse: true,
      index: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    subscription: {
      plan: {
        type: String,
        enum: Object.values(SUBSCRIPTION_PLANS),
        default: SUBSCRIPTION_PLANS.FREE,
      },
      status: {
        type: String,
        enum: Object.values(SUBSCRIPTION_STATUS),
        default: SUBSCRIPTION_STATUS.ACTIVE,
      },
      lemonSqueezyCustomerId: {
        type: String,
        default: null,
        sparse: true,
        index: true,
      },
      lemonSqueezySubscriptionId: {
        type: String,
        default: null,
        sparse: true,
        index: true,
      },
      variantId: {
        type: String,
        default: null,
      },
      currentPeriodEnd: {
        type: Date,
        default: null,
      },
      cancelAtPeriodEnd: {
        type: Boolean,
        default: false,
      },
      customerPortalUrl: {
        type: String,
        default: null,
      },
      updatePaymentUrl: {
        type: String,
        default: null,
      },
    },
    credits: {
      total: {
        type: Number,
        default: 100,
      },
      used: {
        type: Number,
        default: 0,
      },
      lastResetAt: {
        type: Date,
        default: Date.now,
      },
    },
    metadata: {
      lastLoginAt: {
        type: Date,
        default: null,
      },
      loginCount: {
        type: Number,
        default: 0,
      },
      createdFrom: {
        type: String,
        enum: ["google", "email"],
        required: true,
      },
      ipAddress: {
        type: String,
        default: null,
      },
      userAgent: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.methods.hasActiveSubscription = function (): boolean {
  const activeStatuses: string[] = [SUBSCRIPTION_STATUS.ACTIVE, SUBSCRIPTION_STATUS.TRIALING];

  if (this.subscription.plan === SUBSCRIPTION_PLANS.FREE) {
    return true;
  }

  return activeStatuses.includes(this.subscription.status);
};

userSchema.methods.getRemainingCredits = function (): number {
  if (this.subscription.plan !== SUBSCRIPTION_PLANS.FREE) {
    return -1;
  }
  return Math.max(0, this.credits.total - this.credits.used);
};

userSchema.methods.canUseFeature = function (creditCost: number): boolean {
  if (this.subscription.plan !== SUBSCRIPTION_PLANS.FREE) {
    return this.hasActiveSubscription();
  }

  return this.getRemainingCredits() >= creditCost;
};

userSchema.methods.consumeCredits = async function (amount: number): Promise<void> {
  if (this.subscription.plan === SUBSCRIPTION_PLANS.FREE) {
    this.credits.used += amount;
    await this.save();
  }
};

userSchema.methods.resetCredits = async function (): Promise<void> {
  this.credits.used = 0;
  this.credits.lastResetAt = new Date();
  await this.save();
};

userSchema.index({ "subscription.lemonSqueezySubscriptionId": 1 });
userSchema.index({ createdAt: 1 });
userSchema.index({ "metadata.lastLoginAt": 1 });

export const User = mongoose.model<IUser, UserModel>("User", userSchema);

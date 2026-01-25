import mongoose, { Schema, Document, Model } from "mongoose";
import { SUBSCRIPTION_PLANS, SUBSCRIPTION_STATUS, PLAN_LIMITS } from "../constants/index.js";

export interface IUserMethods {
  getDailyLimit(): number;
  getRemainingPrompts(): number;
  canUsePrompt(): boolean;
  consumePrompt(): Promise<void>;
  resetDailyUsage(): Promise<void>;
  checkAndResetDaily(): Promise<void>;
}

export interface IUser extends Document, IUserMethods {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string | null;
  picture: string | null;
  googleId: string | null;
  isEmailVerified: boolean;
  plan: (typeof SUBSCRIPTION_PLANS)[keyof typeof SUBSCRIPTION_PLANS];
  status: (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];
  lemonSqueezyOrderId: string | null;
  lemonSqueezyCustomerId: string | null;
  purchasedAt: Date | null;
  usage: {
    promptsToday: number;
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
    lemonSqueezyOrderId: {
      type: String,
      default: null,
      sparse: true,
      index: true,
    },
    lemonSqueezyCustomerId: {
      type: String,
      default: null,
      sparse: true,
      index: true,
    },
    purchasedAt: {
      type: Date,
      default: null,
    },
    usage: {
      promptsToday: {
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

userSchema.methods.getDailyLimit = function (): number {
  return PLAN_LIMITS[this.plan].dailyPrompts;
};

userSchema.methods.getRemainingPrompts = function (): number {
  return Math.max(0, this.getDailyLimit() - this.usage.promptsToday);
};

userSchema.methods.canUsePrompt = function (): boolean {
  return this.status === SUBSCRIPTION_STATUS.ACTIVE && this.getRemainingPrompts() > 0;
};

userSchema.methods.consumePrompt = async function (): Promise<void> {
  await this.checkAndResetDaily();
  this.usage.promptsToday += 1;
  await this.save();
};

userSchema.methods.resetDailyUsage = async function (): Promise<void> {
  this.usage.promptsToday = 0;
  this.usage.lastResetAt = new Date();
  await this.save();
};

userSchema.methods.checkAndResetDaily = async function (): Promise<void> {
  const now = new Date();
  const lastReset = new Date(this.usage.lastResetAt);

  const isNewDay =
    now.getUTCFullYear() !== lastReset.getUTCFullYear() ||
    now.getUTCMonth() !== lastReset.getUTCMonth() ||
    now.getUTCDate() !== lastReset.getUTCDate();

  if (isNewDay) {
    this.usage.promptsToday = 0;
    this.usage.lastResetAt = now;
  }
};

userSchema.index({ lemonSqueezyOrderId: 1 });
userSchema.index({ createdAt: 1 });
userSchema.index({ "metadata.lastLoginAt": 1 });

export const User = mongoose.model<IUser, UserModel>("User", userSchema);

import { User, type IUser } from "../../models/User.js";
import { SUBSCRIPTION_PLANS, SUBSCRIPTION_STATUS, ERROR_CODES } from "../../constants/index.js";
import { NotFoundError, ConflictError } from "../../utils/errors.js";
import { ERROR_MESSAGES } from "../../constants/messages.js";
import { normalizeEmail } from "../../utils/index.js";
import { sendWelcomeEmail, sendCreditsLowEmail } from "../EmailService.js";
import { trackUserEvent } from "../AnalyticsService.js";
import { findUserByEmail, findUserByGoogleId } from "./queries.js";

interface CreateUserParams {
  email: string;
  name?: string | null;
  picture?: string | null;
  googleId?: string | null;
  isEmailVerified?: boolean;
  createdFrom: "google" | "email";
  ipAddress?: string | null;
  userAgent?: string | null;
}

interface UpdateUserParams {
  name?: string;
  picture?: string;
}

export async function createUser(params: CreateUserParams): Promise<IUser> {
  const normalizedEmail = normalizeEmail(params.email);

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ConflictError(ERROR_MESSAGES.AUTH_EMAIL_EXISTS, ERROR_CODES.AUTH_EMAIL_EXISTS);
  }

  const user = new User({
    email: normalizedEmail,
    name: params.name ?? null,
    picture: params.picture ?? null,
    googleId: params.googleId ?? null,
    isEmailVerified: params.isEmailVerified ?? false,
    plan: SUBSCRIPTION_PLANS.FREE,
    status: SUBSCRIPTION_STATUS.ACTIVE,
    usage: {
      promptsToday: 0,
      lastResetAt: new Date(),
    },
    metadata: {
      createdFrom: params.createdFrom,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
      loginCount: 1,
      lastLoginAt: new Date(),
    },
  });

  await user.save();

  await trackUserEvent(user._id.toString(), "user_signed_up", {
    method: params.createdFrom,
    email: normalizedEmail,
  });

  try {
    await sendWelcomeEmail(user.email, user.name);
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }

  return user;
}

export async function findOrCreateGoogleUser(profile: {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<{ user: IUser; isNewUser: boolean }> {
  let user = await findUserByGoogleId(profile.id);

  if (user) {
    user.metadata.lastLoginAt = new Date();
    user.metadata.loginCount += 1;
    if (profile.ipAddress) user.metadata.ipAddress = profile.ipAddress;
    if (profile.userAgent) user.metadata.userAgent = profile.userAgent;
    await user.save();

    return { user, isNewUser: false };
  }

  user = await findUserByEmail(profile.email);

  if (user) {
    user.googleId = profile.id;
    user.isEmailVerified = true;
    if (!user.name && profile.name) user.name = profile.name;
    if (!user.picture && profile.picture) user.picture = profile.picture;
    user.metadata.lastLoginAt = new Date();
    user.metadata.loginCount += 1;
    await user.save();

    return { user, isNewUser: false };
  }

  user = await createUser({
    email: profile.email,
    name: profile.name ?? null,
    picture: profile.picture ?? null,
    googleId: profile.id,
    isEmailVerified: true,
    createdFrom: "google",
    ipAddress: profile.ipAddress,
    userAgent: profile.userAgent,
  });

  return { user, isNewUser: true };
}

export async function updateUser(userId: string, params: UpdateUserParams): Promise<IUser> {
  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError(ERROR_MESSAGES.AUTH_USER_NOT_FOUND);
  }

  if (params.name !== undefined) user.name = params.name;
  if (params.picture !== undefined) user.picture = params.picture;

  await user.save();

  return user;
}

export async function updateLoginMetadata(
  userId: string,
  ipAddress?: string | null,
  userAgent?: string | null
): Promise<void> {
  await User.findByIdAndUpdate(userId, {
    $set: {
      "metadata.lastLoginAt": new Date(),
      ...(ipAddress && { "metadata.ipAddress": ipAddress }),
      ...(userAgent && { "metadata.userAgent": userAgent }),
    },
    $inc: { "metadata.loginCount": 1 },
  });
}

export async function verifyUserEmail(userId: string): Promise<void> {
  await User.findByIdAndUpdate(userId, {
    $set: { isEmailVerified: true },
  });
}

export async function consumeUserPrompt(
  userId: string
): Promise<{ success: boolean; remaining: number }> {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError(ERROR_MESSAGES.AUTH_USER_NOT_FOUND);
  }

  await user.checkAndResetDaily();

  const remaining = user.getRemainingPrompts();
  if (!user.canUsePrompt()) {
    return { success: false, remaining };
  }

  await user.consumePrompt();
  const newRemaining = user.getRemainingPrompts();

  if (newRemaining <= 3 && newRemaining > 0) {
    try {
      await sendCreditsLowEmail(user.email, newRemaining);
    } catch (error) {
      console.error("Failed to send prompts low email:", error);
    }
  }

  return { success: true, remaining: newRemaining };
}

export async function deleteUser(userId: string): Promise<void> {
  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError(ERROR_MESSAGES.AUTH_USER_NOT_FOUND);
  }

  await trackUserEvent(userId, "user_deleted_account", {
    email: user.email,
    plan: user.plan,
  });

  await User.findByIdAndDelete(userId);
}

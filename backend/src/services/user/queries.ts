import { User, type IUser } from "../../models/User.js";
import { normalizeEmail } from "../../utils/index.js";

export async function findUserByEmail(email: string): Promise<IUser | null> {
  return User.findOne({ email: normalizeEmail(email) });
}

export async function findUserById(userId: string): Promise<IUser | null> {
  return User.findById(userId);
}

export async function findUserByGoogleId(googleId: string): Promise<IUser | null> {
  return User.findOne({ googleId });
}

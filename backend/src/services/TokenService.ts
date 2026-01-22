import jwt from "@fastify/jwt";
import type { FastifyInstance } from "fastify";
import { getRedisClient } from "../config/redis.js";
import { env } from "../config/env.js";
import { JWT_CONFIG, REDIS_KEYS } from "../constants/index.js";
import { generateSecureToken } from "../utils/crypto.js";
import type { JWTPayload } from "../types/index.js";

let fastifyInstance: FastifyInstance | null = null;

export function initializeTokenService(app: FastifyInstance): void {
  fastifyInstance = app;
}

function getApp(): FastifyInstance {
  if (!fastifyInstance) {
    throw new Error("TokenService not initialized. Call initializeTokenService first.");
  }
  return fastifyInstance;
}

export function generateAccessToken(payload: Omit<JWTPayload, "type" | "iat" | "exp">): string {
  const app = getApp();
  return app.jwt.sign({ ...payload, type: "access" }, { expiresIn: env.JWT_ACCESS_EXPIRY });
}

export function generateRefreshToken(payload: Omit<JWTPayload, "type" | "iat" | "exp">): string {
  const app = getApp();
  return app.jwt.sign({ ...payload, type: "refresh" }, { expiresIn: env.JWT_REFRESH_EXPIRY });
}

export function verifyToken(token: string): JWTPayload {
  const app = getApp();
  return app.jwt.verify<JWTPayload>(token);
}

export async function generateTokenPair(
  userId: string,
  email: string
): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const payload = { userId, email };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await storeRefreshToken(userId, refreshToken);

  return { accessToken, refreshToken };
}

export async function storeRefreshToken(userId: string, token: string): Promise<void> {
  const redis = getRedisClient();
  const key = REDIS_KEYS.REFRESH_TOKEN(userId);

  const ttlSeconds = 7 * 24 * 60 * 60;
  await redis.set(key, token, "EX", ttlSeconds);
}

export async function getStoredRefreshToken(userId: string): Promise<string | null> {
  const redis = getRedisClient();
  const key = REDIS_KEYS.REFRESH_TOKEN(userId);
  return redis.get(key);
}

export async function revokeRefreshToken(userId: string): Promise<void> {
  const redis = getRedisClient();
  const key = REDIS_KEYS.REFRESH_TOKEN(userId);
  await redis.del(key);
}

export async function rotateRefreshToken(
  userId: string,
  email: string
): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  await revokeRefreshToken(userId);
  return generateTokenPair(userId, email);
}

export async function validateRefreshToken(userId: string, token: string): Promise<boolean> {
  const storedToken = await getStoredRefreshToken(userId);

  if (!storedToken) {
    return false;
  }

  return storedToken === token;
}

export function generateStateToken(): string {
  return generateSecureToken(32);
}

export async function storeOAuthState(state: string, data: Record<string, unknown>): Promise<void> {
  const redis = getRedisClient();
  const key = `oauth:state:${state}`;

  await redis.set(key, JSON.stringify(data), "EX", 600);
}

export async function getOAuthState(state: string): Promise<Record<string, unknown> | null> {
  const redis = getRedisClient();
  const key = `oauth:state:${state}`;

  const data = await redis.get(key);
  if (!data) return null;

  await redis.del(key);
  return JSON.parse(data);
}

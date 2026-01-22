import type { FastifyInstance } from "fastify";
import { otpRoutes } from "./otp.js";
import { tokenRoutes } from "./tokens.js";
import { googleRoutes } from "./google.js";

export async function authRoutes(app: FastifyInstance): Promise<void> {
  await app.register(otpRoutes, { prefix: "/otp" });
  await app.register(tokenRoutes);
  await app.register(googleRoutes, { prefix: "/google" });
}

import mongoose from "mongoose";
import { env } from "./env.js";

let isConnected = false;

export async function connectDatabase(): Promise<void> {
  if (isConnected) {
    return;
  }

  const MAX_RETRIES = 5;
  const RETRY_DELAY_MS = 5000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(env.MONGODB_URI, {
        dbName: env.MONGODB_DB_NAME,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      isConnected = true;
      console.info(`MongoDB connected to ${env.MONGODB_DB_NAME}`);

      mongoose.connection.on("error", (err: Error) => {
        console.error("MongoDB connection error:", err);
        isConnected = false;
      });

      mongoose.connection.on("disconnected", () => {
        console.warn("MongoDB disconnected");
        isConnected = false;
      });

      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed:`, error);

      if (attempt === MAX_RETRIES) {
        throw new Error("Failed to connect to MongoDB after maximum retries");
      }

      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) {
    return;
  }

  await mongoose.disconnect();
  isConnected = false;
  console.info("MongoDB disconnected");
}

export function isDatabaseConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

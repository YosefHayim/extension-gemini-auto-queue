import { connectDatabase, disconnectDatabase } from "../src/config/database.js";
import { User } from "../src/models/User.js";
import { SUBSCRIPTION_PLANS, SUBSCRIPTION_STATUS } from "../src/constants/index.js";
import { env } from "../src/config/env.js";

async function seed() {
  console.info("Connecting to database...");
  await connectDatabase();

  console.info("Seeding test user...");

  const testUser = await User.findOneAndUpdate(
    { email: "test@example.com" },
    {
      email: "test@example.com",
      name: "Test User",
      isEmailVerified: true,
      subscription: {
        plan: SUBSCRIPTION_PLANS.FREE,
        status: SUBSCRIPTION_STATUS.ACTIVE,
      },
      credits: {
        total: env.FREE_TRIAL_CREDITS,
        used: 0,
        lastResetAt: new Date(),
      },
      metadata: {
        createdFrom: "email",
        loginCount: 0,
      },
    },
    { upsert: true, new: true }
  );

  console.info("Created/updated test user:", testUser.email);

  await disconnectDatabase();
  console.info("Seed complete!");
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTestUser } from "../setup.js";
import {
  findUserByEmail,
  findUserById,
  findUserByGoogleId,
  createUser,
  findOrCreateGoogleUser,
  updateUser,
  updateLoginMetadata,
  verifyUserEmail,
  consumeUserPrompt,
  deleteUser,
} from "../../services/user/index.js";
import { User } from "../../models/User.js";
import { ConflictError, NotFoundError } from "../../utils/errors.js";

vi.mock("../../services/EmailService.js", () => ({
  sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
  sendCreditsLowEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../services/AnalyticsService.js", () => ({
  trackUserEvent: vi.fn().mockResolvedValue(undefined),
  identifyUser: vi.fn().mockResolvedValue(undefined),
}));

describe("UserService - Queries", () => {
  describe("findUserByEmail", () => {
    it("should find user by email", async () => {
      const testUser = await createTestUser({ email: "find@example.com" });

      const found = await findUserByEmail("find@example.com");

      expect(found).not.toBeNull();
      expect(found?.email).toBe(testUser.email);
    });

    it("should normalize email before searching", async () => {
      await createTestUser({ email: "normalized@example.com" });

      const found = await findUserByEmail("  NORMALIZED@EXAMPLE.COM  ");

      expect(found).not.toBeNull();
      expect(found?.email).toBe("normalized@example.com");
    });

    it("should return null for non-existent email", async () => {
      const found = await findUserByEmail("nonexistent@example.com");

      expect(found).toBeNull();
    });
  });

  describe("findUserById", () => {
    it("should find user by ID", async () => {
      const testUser = await createTestUser();

      const found = await findUserById(testUser._id.toString());

      expect(found).not.toBeNull();
      expect(found?._id.toString()).toBe(testUser._id.toString());
    });

    it("should return null for non-existent ID", async () => {
      const found = await findUserById("507f1f77bcf86cd799439011");

      expect(found).toBeNull();
    });
  });

  describe("findUserByGoogleId", () => {
    it("should find user by Google ID", async () => {
      const testUser = await createTestUser({ googleId: "google-abc123" });

      const found = await findUserByGoogleId("google-abc123");

      expect(found).not.toBeNull();
      expect(found?.googleId).toBe("google-abc123");
    });

    it("should return null for non-existent Google ID", async () => {
      const found = await findUserByGoogleId("nonexistent-google-id");

      expect(found).toBeNull();
    });
  });
});

describe("UserService - Mutations", () => {
  describe("createUser", () => {
    it("should create a new user with email signup", async () => {
      const user = await createUser({
        email: "newuser@example.com",
        name: "New User",
        createdFrom: "email",
      });

      expect(user.email).toBe("newuser@example.com");
      expect(user.name).toBe("New User");
      expect(user.plan).toBe("free");
      expect(user.status).toBe("active");
      expect(user.metadata.createdFrom).toBe("email");
      expect(user.usage.promptsToday).toBe(0);
    });

    it("should throw ConflictError for duplicate email", async () => {
      await createTestUser({ email: "duplicate@example.com" });

      await expect(
        createUser({
          email: "duplicate@example.com",
          createdFrom: "email",
        })
      ).rejects.toThrow(ConflictError);
    });

    it("should normalize email on creation", async () => {
      const user = await createUser({
        email: "  UPPERCASE@EXAMPLE.COM  ",
        createdFrom: "email",
      });

      expect(user.email).toBe("uppercase@example.com");
    });
  });

  describe("findOrCreateGoogleUser", () => {
    it("should return existing user by Google ID", async () => {
      const existingUser = await createTestUser({
        email: "google@example.com",
        googleId: "existing-google-id",
      });

      const { user, isNewUser } = await findOrCreateGoogleUser({
        id: "existing-google-id",
        email: "google@example.com",
        name: "Google User",
      });

      expect(isNewUser).toBe(false);
      expect(user._id.toString()).toBe(existingUser._id.toString());
    });

    it("should link Google ID to existing email user", async () => {
      await createTestUser({ email: "link@example.com" });

      const { user, isNewUser } = await findOrCreateGoogleUser({
        id: "new-google-id",
        email: "link@example.com",
        name: "Linked User",
      });

      expect(isNewUser).toBe(false);
      expect(user.googleId).toBe("new-google-id");
      expect(user.isEmailVerified).toBe(true);
    });

    it("should create new user for new Google account", async () => {
      const { user, isNewUser } = await findOrCreateGoogleUser({
        id: "brand-new-google-id",
        email: "brandnew@example.com",
        name: "Brand New User",
        picture: "https://example.com/pic.jpg",
      });

      expect(isNewUser).toBe(true);
      expect(user.googleId).toBe("brand-new-google-id");
      expect(user.email).toBe("brandnew@example.com");
      expect(user.picture).toBe("https://example.com/pic.jpg");
      expect(user.metadata.createdFrom).toBe("google");
    });

    it("should increment login count for existing user", async () => {
      const existingUser = await createTestUser({
        email: "logincount@example.com",
        googleId: "login-count-google-id",
      });
      const initialCount = existingUser.metadata.loginCount;

      const { user } = await findOrCreateGoogleUser({
        id: "login-count-google-id",
        email: "logincount@example.com",
      });

      expect(user.metadata.loginCount).toBe(initialCount + 1);
    });
  });

  describe("updateUser", () => {
    it("should update user name", async () => {
      const testUser = await createTestUser({ name: "Old Name" });

      const updated = await updateUser(testUser._id.toString(), {
        name: "New Name",
      });

      expect(updated.name).toBe("New Name");
    });

    it("should update user picture", async () => {
      const testUser = await createTestUser();

      const updated = await updateUser(testUser._id.toString(), {
        picture: "https://newpic.example.com/avatar.jpg",
      });

      expect(updated.picture).toBe("https://newpic.example.com/avatar.jpg");
    });

    it("should throw NotFoundError for non-existent user", async () => {
      await expect(updateUser("507f1f77bcf86cd799439011", { name: "Test" })).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("updateLoginMetadata", () => {
    it("should update login metadata", async () => {
      const testUser = await createTestUser();
      const initialLoginCount = testUser.metadata.loginCount;

      await updateLoginMetadata(testUser._id.toString(), "192.168.1.1", "Test Agent");

      const updated = await User.findById(testUser._id);
      expect(updated?.metadata.ipAddress).toBe("192.168.1.1");
      expect(updated?.metadata.userAgent).toBe("Test Agent");
      expect(updated?.metadata.loginCount).toBe(initialLoginCount + 1);
      expect(updated?.metadata.lastLoginAt).toBeDefined();
    });
  });

  describe("verifyUserEmail", () => {
    it("should set isEmailVerified to true", async () => {
      const testUser = await createTestUser({ isEmailVerified: false });
      expect(testUser.isEmailVerified).toBe(false);

      await verifyUserEmail(testUser._id.toString());

      const updated = await User.findById(testUser._id);
      expect(updated?.isEmailVerified).toBe(true);
    });
  });

  describe("consumeUserPrompt", () => {
    it("should consume a prompt for free user", async () => {
      const testUser = await createTestUser({ plan: "free" });

      const result = await consumeUserPrompt(testUser._id.toString());

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it("should consume a prompt for lifetime user", async () => {
      const testUser = await createTestUser({ plan: "lifetime" });

      const result = await consumeUserPrompt(testUser._id.toString());

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(99);
    });

    it("should return success false when limit reached", async () => {
      const testUser = await createTestUser({ plan: "free" });
      testUser.usage.promptsToday = 10;
      await testUser.save();

      const result = await consumeUserPrompt(testUser._id.toString());

      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("should throw NotFoundError for non-existent user", async () => {
      await expect(consumeUserPrompt("507f1f77bcf86cd799439011")).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteUser", () => {
    it("should delete user", async () => {
      const testUser = await createTestUser();

      await deleteUser(testUser._id.toString());

      const found = await User.findById(testUser._id);
      expect(found).toBeNull();
    });

    it("should throw NotFoundError for non-existent user", async () => {
      await expect(deleteUser("507f1f77bcf86cd799439011")).rejects.toThrow(NotFoundError);
    });
  });
});

import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  picture: z.string().url().optional(),
});

export const featureCheckSchema = z.object({
  feature: z.enum([
    "QUEUE_PROCESSING",
    "IMAGE_GENERATION",
    "VIDEO_GENERATION",
    "DEEP_RESEARCH",
    "CANVAS",
    "BULK_ACTIONS",
    "TEMPLATES",
    "SCHEDULING",
    "EXPORT",
  ]),
});

export const syncDataSchema = z.object({
  preferences: z
    .object({
      theme: z.string().optional(),
      primaryModel: z.string().optional(),
      defaultTool: z.string().optional(),
      dripFeed: z.boolean().optional(),
      dripFeedDelay: z.number().optional(),
      autoStopOnError: z.boolean().optional(),
      analyticsEnabled: z.boolean().optional(),
      sidebarWidth: z.number().optional(),
      preferredAIProvider: z.string().optional(),
    })
    .optional(),
  metadata: z
    .object({
      country: z.string().optional(),
      timezone: z.string().optional(),
      language: z.string().optional(),
      platform: z.string().optional(),
      extensionVersion: z.string().optional(),
      userAgent: z.string().optional(),
    })
    .optional(),
});

export const trackEventSchema = z.object({
  event: z.string().min(1).max(100),
  properties: z.record(z.unknown()).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type FeatureCheckInput = z.infer<typeof featureCheckSchema>;
export type SyncDataInput = z.infer<typeof syncDataSchema>;
export type TrackEventInput = z.infer<typeof trackEventSchema>;

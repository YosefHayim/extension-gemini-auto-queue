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

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type FeatureCheckInput = z.infer<typeof featureCheckSchema>;

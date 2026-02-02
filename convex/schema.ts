import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  generations: defineTable({
    category: v.union(
      v.literal("restaurant"),
      v.literal("supermarket"),
      v.literal("online")
    ),
    businessName: v.string(),
    productName: v.string(),
    inputs: v.string(), // JSON stringified form data (without images)
    outputs: v.array(
      v.object({
        format: v.string(),
        imageUrl: v.string(), // stored as base64 data URL or storage URL
      })
    ),
  }).index("by_category", ["category"]),
});

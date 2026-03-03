"use client";

import { postFormDataSchema } from "./validation";
import type { PostFormData } from "./types";

export type FormErrors = Record<string, string>;

/**
 * Validate form data client-side using the same Zod schemas used on the server.
 * Returns null if valid, or a map of field → error message.
 */
export function validatePostForm(data: PostFormData): FormErrors | null {
  const result = postFormDataSchema.safeParse(data);
  if (result.success) return null;

  const errors: FormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0]?.toString();
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }
  return Object.keys(errors).length > 0 ? errors : null;
}

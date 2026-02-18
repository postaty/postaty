import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { DEV_ORG_ID, DEV_USER_ID } from "@/lib/dev-auth";

/**
 * Dev-mode identity hook. Returns hardcoded org/user IDs.
 * Replace with real auth hook when Clerk is integrated.
 */
export function useDevIdentity(): {
  orgId: Id<"organizations"> | null;
  userId: Id<"users"> | null;
  isLoading: boolean;
  isAuthenticated: boolean;
} {
  const authEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const currentUser = useQuery(
    api.users.getCurrentUser,
    authEnabled && isAuthenticated ? {} : "skip"
  );

  if (!authEnabled) {
    return {
      orgId: DEV_ORG_ID,
      userId: DEV_USER_ID,
      isLoading: false,
      isAuthenticated: false,
    };
  }

  const isLoading =
    isAuthLoading || (isAuthenticated && currentUser === undefined);
  if (isLoading) {
    return {
      orgId: null,
      userId: null,
      isLoading: true,
      isAuthenticated,
    };
  }

  if (!isAuthenticated || !currentUser) {
    return {
      orgId: null,
      userId: null,
      isLoading: false,
      isAuthenticated: false,
    };
  }

  return {
    orgId: currentUser.orgId,
    userId: currentUser._id,
    isLoading: false,
    isAuthenticated: true,
  };
}

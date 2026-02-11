"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { ReactNode } from "react";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL in your .env.local file");
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
const useAuthNoop = () => ({
  isLoaded: true,
  isSignedIn: false,
  getToken: async () => null,
  orgId: null,
  orgRole: null,
});

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithClerk
      client={convex}
      useAuth={clerkEnabled ? useAuth : useAuthNoop}
    >
      {children}
    </ConvexProviderWithClerk>
  );
}

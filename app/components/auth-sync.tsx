"use client";

import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";

const COUNTRY_COOKIE = "pst_country";

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const pair = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));
  return pair?.split("=")[1];
}

export function AuthSync() {
  const { isLoaded, isSignedIn, user } = useUser();
  const syncCurrentUser = useMutation(api.users.syncCurrentUser);
  const didSync = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || didSync.current) return;

    const email = user.primaryEmailAddress?.emailAddress;
    if (!email) return;

    didSync.current = true;
    const detectedCountry = readCookie(COUNTRY_COOKIE);

    void syncCurrentUser({
      email,
      name: user.fullName ?? user.username ?? email.split("@")[0] ?? "User",
      detectedCountry,
    }).catch((error) => {
      didSync.current = false;
      console.error("Failed to sync current user:", error);
    });
  }, [isLoaded, isSignedIn, user, syncCurrentUser]);

  return null;
}

"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  bumpSession,
  trackPageView,
  trackFormAbandonIfOpen,
} from "@/lib/analytics/client";

interface AnalyticsProviderProps {
  userId: string | null;
  isAuthenticated: boolean;
  children: React.ReactNode;
}

const HEARTBEAT_MS = 60_000;

export default function AnalyticsProvider({
  userId,
  isAuthenticated,
  children,
}: AnalyticsProviderProps) {
  const pathname = usePathname();
  const lastPathRef = useRef<string | null>(null);

  // Bump session on mount + when auth state changes
  useEffect(() => {
    bumpSession({ userId, isAuthenticated });
  }, [userId, isAuthenticated]);

  // Page view + bump on every route change
  useEffect(() => {
    if (!pathname) return;
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;
    trackPageView(pathname);
    bumpSession({ userId, isAuthenticated });
  }, [pathname, userId, isAuthenticated]);

  // Heartbeat: keep the session "live" for visitors who stay on one page.
  useEffect(() => {
    function beat() {
      if (document.visibilityState === "visible") {
        bumpSession({ userId, isAuthenticated });
      }
    }
    const id = setInterval(beat, HEARTBEAT_MS);
    document.addEventListener("visibilitychange", beat);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", beat);
    };
  }, [userId, isAuthenticated]);

  // Abandon detection on tab close / navigation away
  useEffect(() => {
    function onLeave() {
      trackFormAbandonIfOpen();
    }
    window.addEventListener("pagehide", onLeave);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("pagehide", onLeave);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, []);

  return <>{children}</>;
}

"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  bumpSession,
  endSession,
  trackPageView,
  trackFormAbandonIfOpen,
} from "@/lib/analytics/client";

interface AnalyticsProviderProps {
  userId: string | null;
  isAuthenticated: boolean;
  children: React.ReactNode;
}

const HEARTBEAT_MS = 15_000;

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

  // Heartbeat: keep the session "live" while the tab is visible. We do NOT
  // end the session on visibilitychange — switching tabs is normal behavior
  // (e.g. opening the admin in another tab) and shouldn't drop the counter.
  // The 2-min staleness window in the live query handles inactive tabs.
  useEffect(() => {
    function bump() {
      if (document.visibilityState === "visible") {
        bumpSession({ userId, isAuthenticated });
      }
    }
    bump();
    const id = setInterval(bump, HEARTBEAT_MS);
    document.addEventListener("visibilitychange", bump);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", bump);
    };
  }, [userId, isAuthenticated]);

  // Abandon + end-session detection on tab close / navigation away
  useEffect(() => {
    function onLeave() {
      trackFormAbandonIfOpen();
      endSession();
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

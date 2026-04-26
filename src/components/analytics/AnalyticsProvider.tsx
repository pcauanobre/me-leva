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

export default function AnalyticsProvider({
  userId,
  isAuthenticated,
  children,
}: AnalyticsProviderProps) {
  const pathname = usePathname();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    bumpSession({ userId, isAuthenticated });
  }, [userId, isAuthenticated]);

  useEffect(() => {
    if (!pathname) return;
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;
    trackPageView(pathname);
  }, [pathname]);

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

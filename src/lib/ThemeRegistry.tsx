"use client";

import * as React from "react";
import { useState } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import createCache from "@emotion/cache";
import type { EmotionCache, Options as CacheOptions } from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import theme from "./theme";

// Adapted from https://github.com/emotion-js/emotion/issues/2928#issuecomment-1319747902
function useEmotionCache(options: CacheOptions) {
  const [cache] = useState(() => {
    const c = createCache(options);
    c.compat = true;
    const prevInsert = c.insert;
    let inserted: string[] = [];
    c.insert = (...args) => {
      const serialized = args[1];
      if (!c.inserted[serialized.name]) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    (c as EmotionCache & { flush: () => string[] }).flush = flush;
    return c as EmotionCache & { flush: () => string[] };
  });

  useServerInsertedHTML(() => {
    const names = cache.flush();
    if (names.length === 0) return null;
    let styles = "";
    for (const name of names) {
      if (cache.inserted[name] !== true && cache.inserted[name]) {
        styles += cache.inserted[name];
      }
    }
    if (!styles) return null;
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return cache;
}

export default function ThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const cache = useEmotionCache({ key: "mui", prepend: true });

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}

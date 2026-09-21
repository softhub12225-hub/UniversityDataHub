import { Suspense } from "react";

import { PlatformChrome } from "@/components/platform/platform-chrome";

import "../platform.css";

/**
 * The public platform's frame.
 *
 * Search sits in the rail on every page, which is the structural decision that keeps
 * this off the portal template: those sites put a search box inside a photographic
 * hero on the home page and a different one in the header everywhere else. Here there
 * is one search, it is part of the application frame, and the catalogue is the first
 * thing you see rather than a marketing page you scroll past.
 *
 * The chrome itself is a client component because it reads the locale from the query
 * string and layouts are not given `searchParams`. `Suspense` is required around any
 * component that calls `useSearchParams()` so the rest of the page can still be
 * prerendered rather than the whole route opting out.
 */
export default function PlatformLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense fallback={<div className="pf">{children}</div>}>
      <PlatformChrome>{children}</PlatformChrome>
    </Suspense>
  );
}

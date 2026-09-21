import { Fraunces, Instrument_Sans } from "next/font/google";
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
 *
 * THE TYPEFACES, AT LAST
 * ======================
 * `platform.css` has named Fraunces and Instrument Sans since it was written, and
 * nothing ever loaded them -- so every page was really rendering in Georgia and
 * system-ui, and the design was being judged on a substitute.
 *
 * `next/font` rather than a Google Fonts `<link>`: it fetches the files at build time
 * and serves them from this origin, so a visitor's page load makes no third-party
 * request, leaks no referrer to a font CDN, and suffers no layout shift waiting on a
 * remote stylesheet. The cost is that the build needs network, which it already needs
 * in order to install dependencies.
 *
 * LATIN ONLY, AND WHY THAT IS RIGHT HERE
 * ======================================
 * Neither face carries Chinese glyphs, and this interface is Chinese-first. A CJK
 * webfont would add megabytes for the majority of the text, so Chinese falls through
 * to Noto Sans/Serif SC where installed and to the platform CJK font otherwise.
 * Institution names, which QS publishes in English, get the display serif either way.
 * The two locales therefore set headings in different faces: a deliberate trade of
 * visual uniformity against not making every reader download a font the size of the
 * page they came for.
 */

const displaySerif = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--pf-font-serif",
});

const textSans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--pf-font-sans",
});

/** Both faces expose themselves as custom properties; `platform.css` reads them. */
const fontVariables = `${displaySerif.variable} ${textSans.variable}`;

export default function PlatformLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense fallback={<div className={`pf ${fontVariables}`}>{children}</div>}>
      <PlatformChrome fontClassName={fontVariables}>{children}</PlatformChrome>
    </Suspense>
  );
}

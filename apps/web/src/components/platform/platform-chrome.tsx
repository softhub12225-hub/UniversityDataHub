"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { NavigationProgress } from "@/components/platform/navigation-progress";
import { DEFAULT_LOCALE, HTML_LANG, type Locale, parseLocale, t } from "@/lib/i18n";

/**
 * The platform's frame: rail, language toggle, footer.
 *
 * WHY THIS IS A CLIENT COMPONENT WHEN THE PAGES ARE NOT
 * =====================================================
 * Next does not pass `searchParams` to layouts, and the locale lives in the query
 * string. The rail therefore reads it with `useSearchParams()` while the pages read it
 * from their own `searchParams` prop — both see the same URL, so they cannot disagree.
 * `children` is still server-rendered and passed straight through, so making the frame
 * a client component costs nothing in the content.
 *
 * The toggle is a real `<a href>`, so switching language works with JavaScript off and
 * the back button behaves. Only the `<html lang>` sync below needs scripting, and that
 * is a progressive enhancement rather than a requirement.
 */
export function PlatformChrome({
  children,
  fontClassName = "",
}: {
  children: React.ReactNode;
  /** The webfont custom-property classes from the layout. See its header. */
  fontClassName?: string;
}) {
  const params = useSearchParams();
  const pathname = usePathname();
  const locale = parseLocale(params.get("lang") ?? undefined);
  const copy = t(locale);

  // `<html lang>` is set by the root layout, which is a server component with no
  // access to the query string. Assistive technology reads that attribute to choose
  // a voice, so leaving it as zh-CN on an English page would be a real defect rather
  // than a cosmetic one. Correcting it here is the one thing the toggle needs JS for.
  useEffect(() => {
    document.documentElement.lang = HTML_LANG[locale];
  }, [locale]);

  return (
    <div className={`pf ${fontClassName}`}>
      {/* Mounted once, in the frame, so it covers every navigation on every
          page rather than needing to be remembered per link. */}
      <NavigationProgress />
      <header className="pf-rail">
        <Link className="pf-brand" href={href("/", locale)}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            <path d="M3 9.5 12 4l9 5.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6.5 11.5v6.5M11 11.5v6.5M15.5 11.5v6.5" strokeLinecap="round" />
            <path d="M4 20h16" strokeLinecap="round" />
          </svg>
          <span>{copy.brand}</span>
        </Link>

        <form className="pf-railsearch" action="/" method="get" role="search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4.3-4.3" strokeLinecap="round" />
          </svg>
          <label className="pf-sr" htmlFor="pf-q">
            {copy.searchLabel}
          </label>
          <input id="pf-q" name="q" type="search" placeholder={copy.searchPlaceholder} />
          {/* Carried through the form so searching does not silently switch language. */}
          {locale !== DEFAULT_LOCALE ? <input type="hidden" name="lang" value={locale} /> : null}
        </form>

        <nav className="pf-railnav">
          {/* System status and the reviewer console used to sit here. Both are
              internal: one is an operations dashboard, the other needs an account an
              administrator has to issue. Putting them in the public header advertised
              two doors nobody visiting this site can open. The console is still
              reachable -- Sign in, below, goes straight to it. */}
          <Link href={href("/", locale)}>{copy.navInstitutions}</Link>

          {/* The toggle sits between the navigation and the sign-in call to action:
              a language switch is a property of the whole interface, so it belongs in
              the frame, not inside a page. */}
          <Link
            className="pf-lang"
            href={toggleHref(pathname, params, locale)}
            hrefLang={locale === "zh" ? "en" : "zh-CN"}
            aria-label={copy.toggleLabel}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M3.6 9h16.8M3.6 15h16.8" strokeLinecap="round" />
              <path d="M12 3c2.4 2.4 3.6 5.4 3.6 9s-1.2 6.6-3.6 9c-2.4-2.4-3.6-5.4-3.6-9S9.6 5.4 12 3Z" />
            </svg>
            {copy.toggleTo}
          </Link>

          <Link className="pf-cta" href="/review/login">
            {copy.navSignIn}
          </Link>
        </nav>
      </header>

      {children}

      {/* The QS attribution line that sat here was removed on request. Coverage is
          still defined by QS 2027 rank and rank values are still never displayed --
          both facts now live only in `catalogue.ts`, where the data is generated,
          rather than on screen. */}
      <footer className="pf-foot">
        <span className="pf-foot-brand">{copy.brand}</span>
      </footer>
    </div>
  );
}

function href(path: string, locale: Locale): string {
  return locale === DEFAULT_LOCALE ? path : `${path}?lang=en`;
}

/**
 * The same page in the other language: every filter, page and sort is preserved, so
 * switching language never silently resets what the user was looking at.
 */
function toggleHref(
  pathname: string,
  params: URLSearchParams,
  locale: Locale,
): string {
  const next = new URLSearchParams(params.toString());
  if (locale === "zh") {
    next.set("lang", "en");
  } else {
    next.delete("lang");
  }
  const query = next.toString();
  return query ? `${pathname}?${query}` : pathname;
}

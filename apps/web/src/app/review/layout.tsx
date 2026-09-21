/**
 * Shell for the reviewer console.
 *
 * The identity shown in the rail comes from `/auth/me`, which resolves the session
 * cookie on the server. It is displayed, never trusted: no request carries it, and the
 * backend derives the actor from the same cookie on every call. Showing it is so a
 * reviewer can see who the system thinks they are — and which roles it thinks they
 * hold — before they decide anything.
 *
 * WHY A SIDE RAIL RATHER THAN THE TOP NAV THIS REPLACED
 * =====================================================
 * A reviewer does not visit the console, they sit in it: open a queue, open an
 * institution, read the stored evidence, preview, decide, come back. A horizontal bar
 * spends the console's scarcest axis — vertical room for rows of evidence — on three
 * links, and it gives the current location nowhere legible to live. The rail costs
 * 208px of width, which the layout has, keeps the reviewer's identity and roles
 * permanently in view next to the buttons that record decisions in their name, and
 * lets `aria-current` mark where they are.
 *
 * The login page renders bare. There is nothing to navigate to until the session
 * resolves, and offering the links to someone who is not signed in would only produce
 * redirects back to where they already are.
 */

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Loading } from "@/components/review/primitives";
import { Seal } from "@/components/review/seal";
import { ReviewApiError, reviewApi } from "@/lib/review/client";
import type { SessionInfo } from "@/lib/review/types";

import "./review.css";

/**
 * Labels name what the reviewer does there, not what the tables are called.
 * "Queue" is the work; "Institutions" is the catalogue they work through;
 * "Operations" is the audit and evidence surface.
 */
const NAV: readonly { href: string; label: string; hint: string }[] = [
  { href: "/review", label: "Queue", hint: "Candidate claims awaiting a decision" },
  { href: "/review/institutions", label: "Institutions", hint: "Coverage and source state" },
  { href: "/review/operations", label: "Operations", hint: "Audit trail and stored evidence" },
];

export default function ReviewLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [checked, setChecked] = useState(false);
  const onLogin = pathname === "/review/login";

  useEffect(() => {
    let cancelled = false;
    reviewApi
      .me()
      .then((info) => {
        if (!cancelled) setSession(info);
      })
      .catch((error: unknown) => {
        // 401 is the ordinary "not logged in" answer, not a failure to report.
        if (!cancelled && error instanceof ReviewApiError && error.status === 401 && !onLogin) {
          router.replace("/review/login");
        }
      })
      .finally(() => {
        if (!cancelled) setChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname, onLogin, router]);

  const logout = useCallback(async () => {
    await reviewApi.logout().catch(() => undefined);
    setSession(null);
    router.replace("/review/login");
  }, [router]);

  if (!checked && !onLogin) {
    return (
      <div className="rv-page">
        <div className="rv-content" style={{ maxWidth: "640px", margin: "auto" }}>
          <Loading rows={2} label="Checking your session" />
        </div>
      </div>
    );
  }

  if (onLogin) {
    return <div className="rv-page">{children}</div>;
  }

  const current = NAV.reduce<string>(
    // Longest matching prefix wins, so /review/institutions does not also light up
    // /review. Exact-match-or-prefix on its own would mark two links at once.
    (best, item) =>
      (pathname === item.href || pathname.startsWith(`${item.href}/`)) &&
      item.href.length > best.length
        ? item.href
        : best,
    "",
  );

  return (
    <div className="rv-page">
      <nav className="rv-rail" aria-label="Reviewer console">
        <Link href="/review" className="rv-rail-brand">
          <Seal />
          <span>Reviewer Console</span>
        </Link>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rv-rail-link"
            title={item.hint}
            aria-current={current === item.href ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
        <div className="rv-rail-foot">
          {session ? (
            <>
              <span className="rv-who">
                <span className="rv-who-mark" aria-hidden="true">
                  {initials(session.display_name)}
                </span>
                <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                  <strong style={{ fontSize: "13px", fontWeight: 600 }}>
                    {session.display_name}
                  </strong>
                  {/* Roles are shown because they decide which buttons will work. A
                      reviewer who cannot publish should learn that here, not from a
                      blocker after composing a decision. */}
                  <span className="rv-sub">{session.roles.join(" · ") || "no roles"}</span>
                </span>
              </span>
              <button type="button" className="rv-button" data-variant="secondary" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <span className="rv-sub">No session</span>
          )}
        </div>
      </nav>
      <div className="rv-content">{children}</div>
    </div>
  );
}

/** Initials, for the identity mark. Falls back to a dash rather than an empty box. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  if (first === undefined) return "—";
  const last = parts[parts.length - 1] ?? first;
  const letters = `${first[0] ?? ""}${parts.length > 1 ? (last[0] ?? "") : ""}`;
  return letters.toUpperCase() || "—";
}


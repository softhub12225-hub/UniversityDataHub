"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * A link that throws off a burst of light where it was clicked.
 *
 * WHY IT IS RENDERED INTO THE BODY AND NOT INTO THE BUTTON
 * ========================================================
 * `.pf-result` has `overflow: hidden` -- that is what keeps the verified bar inside
 * the card's rounded corner. Sparks drawn inside the button would be sliced off at the
 * card edge, and the button sits close enough to the right edge that the clipping
 * would be lopsided rather than subtle. A fixed-position layer portalled to `document.body`
 * escapes every ancestor's clipping and stacking context, so the burst is the same
 * shape wherever the button happens to be.
 *
 * WHY IT DOES NOT DELAY THE NAVIGATION
 * ====================================
 * The click is not intercepted and nothing is awaited: the burst is fired and the link
 * navigates immediately. Holding a navigation open to finish an animation trades the
 * user's time for decoration, which is the wrong way round. The dossier route is
 * server-rendered on demand, so in practice the burst plays across the transition and
 * is cut off when the new page commits -- which is the right priority, and looks
 * deliberate rather than truncated because the sparks fade as they travel.
 *
 * REDUCED MOTION IS CHECKED HERE, NOT ONLY IN CSS
 * ===============================================
 * A media query would still mount the elements and animate them to a standstill. This
 * asks first and never creates them, so the preference costs nothing to honour.
 */

interface Burst {
  readonly id: number;
  /** Viewport coordinates: the layer is `position: fixed`, so these are used as-is. */
  readonly x: number;
  readonly y: number;
}

/** How long the longest spark takes, plus a little. Must match the CSS. */
const BURST_MS = 620;

/**
 * Twelve sparks on an even ring, with distance and size varied by index so the burst
 * reads as an explosion rather than a snowflake. Deterministic on purpose: a random
 * value here would be a new number on every render for no visible gain.
 */
const SPARKS = Array.from({ length: 12 }, (_, index) => {
  const angle = index * 30;
  // Alternating long/short arms, plus a slow drift, so no two neighbours match.
  const distance = 34 + (index % 3) * 13 + (index % 2 === 0 ? 8 : 0);
  const size = index % 4 === 0 ? 5 : index % 3 === 0 ? 3 : 4;
  const hue = ["var(--pf-dawn-4)", "var(--pf-dawn-3)", "var(--pf-dawn-2)"][index % 3];
  return { angle, distance, size, hue, delay: (index % 4) * 14 };
});

export function BurstLink({
  href,
  className,
  children,
  ariaLabel,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  /**
   * Overrides the accessible name. Used where several of these sit on one page with
   * the same visible words and only the destination differs -- a list of results,
   * where "More Detail" alone tells a screen reader nothing about which.
   */
  ariaLabel?: string;
}) {
  const [bursts, setBursts] = useState<readonly Burst[]>([]);
  const [mounted, setMounted] = useState(false);
  const nextId = useRef(0);
  /** Outstanding cleanup timers, so a burst in flight at unmount does not leak one. */
  const timers = useRef(new Set<number>());

  useEffect(() => {
    setMounted(true);
    // Captured into a local so the cleanup closes over the same Set the effect saw,
    // rather than re-reading a ref that could in principle point somewhere else by
    // the time it runs. It cannot here -- the ref is never reassigned -- but the rule
    // is right in general and the fix costs a line.
    const pending = timers.current;
    return () => {
      for (const timer of pending) window.clearTimeout(timer);
      pending.clear();
    };
  }, []);

  const fire = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    // A keyboard "click" reports 0,0; burst from the middle of the control instead of
    // the top-left corner of the screen.
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX || rect.left + rect.width / 2;
    const y = event.clientY || rect.top + rect.height / 2;

    const id = nextId.current;
    nextId.current += 1;
    setBursts((current) => [...current, { id, x, y }]);

    const timer = window.setTimeout(() => {
      setBursts((current) => current.filter((burst) => burst.id !== id));
      // Forget the timer as it fires, so a long session of clicking does not
      // accumulate a set of ids that have all already run.
      timers.current.delete(timer);
    }, BURST_MS);
    timers.current.add(timer);
  }, []);

  return (
    <>
      <Link href={href} className={className} aria-label={ariaLabel} onClick={fire}>
        {children}
      </Link>
      {mounted && bursts.length > 0
        ? createPortal(
            <div className="pf-burst-layer" aria-hidden="true">
              {bursts.map((burst) => (
                <span key={burst.id} className="pf-burst" style={{ left: burst.x, top: burst.y }}>
                  <span className="pf-burst-flash" />
                  <span className="pf-burst-ring" />
                  {SPARKS.map((spark, index) => (
                    <span
                      key={index}
                      className="pf-burst-spark"
                      style={
                        {
                          "--pf-spark-angle": `${spark.angle}deg`,
                          "--pf-spark-distance": `${spark.distance}px`,
                          "--pf-spark-size": `${spark.size}px`,
                          "--pf-spark-colour": spark.hue,
                          animationDelay: `${spark.delay}ms`,
                        } as React.CSSProperties
                      }
                    />
                  ))}
                </span>
              ))}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

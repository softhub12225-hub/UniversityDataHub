"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * A beam of light across the top of the page while a navigation is in flight.
 *
 * WHY THIS IS NEEDED AT ALL
 * =========================
 * Both platform routes are `force-dynamic`, so every facet toggle, sort, page number
 * and More Detail is a server round-trip. Until it returns the browser shows the old
 * page, unchanged -- which is indistinguishable from a click that did not register,
 * and the reflex is to click again.
 *
 * WHY IT LISTENS ON THE DOCUMENT INSTEAD OF BEING WIRED INTO EACH LINK
 * ====================================================================
 * Next 15.1 has no `useLinkStatus` -- that arrives in 15.3 -- so a `<Link>` cannot
 * report its own pending state. The alternative is to replace every navigating control
 * with a client component that pushes inside a transition: the pager, the facets, the
 * chips, the crest, the brand, the button. That is a lot of surface to convert, and
 * every future link added by someone who does not know about this would silently miss
 * it. One capture-phase listener covers all of them and cannot be forgotten.
 *
 * IT WAITS BEFORE IT APPEARS
 * ==========================
 * Showing instantly would mean a flicker on every fast navigation, which reads as a
 * glitch rather than as progress. Nothing is drawn until the navigation has already
 * taken longer than a person would call instant.
 *
 * HOW IT KNOWS IT IS DONE
 * =======================
 * `usePathname` and `useSearchParams` change when the new page commits. Both are
 * needed: paging from `?page=2` to `?page=3` never changes the pathname, and watching
 * only the pathname would leave the beam running forever on exactly the control this
 * was built for.
 */

/** Long enough that an instant navigation never flashes the beam. */
const APPEAR_AFTER_MS = 140;

/**
 * A navigation that has not committed by now is not going to be tracked correctly --
 * a download, a cross-document form post, a route that threw. The beam gives up
 * rather than spinning forever, which is the failure mode that makes a page feel
 * broken instead of slow.
 */
const GIVE_UP_AFTER_MS = 12_000;

export function NavigationProgress() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const [active, setActive] = useState(false);
  const appearTimer = useRef<number | null>(null);
  const giveUpTimer = useRef<number | null>(null);
  const settled = useRef(false);

  useEffect(() => {
    function clearTimers() {
      if (appearTimer.current !== null) window.clearTimeout(appearTimer.current);
      if (giveUpTimer.current !== null) window.clearTimeout(giveUpTimer.current);
      appearTimer.current = null;
      giveUpTimer.current = null;
    }

    function begin() {
      clearTimers();
      appearTimer.current = window.setTimeout(() => setActive(true), APPEAR_AFTER_MS);
      giveUpTimer.current = window.setTimeout(() => {
        clearTimers();
        setActive(false);
      }, GIVE_UP_AFTER_MS);
    }

    function onClick(event: MouseEvent) {
      // Anything that is not a plain left-click opens elsewhere, or is being handled
      // by something that already called preventDefault.
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (href === null || href.startsWith("#")) return;

      let destination: URL;
      try {
        destination = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      // A source link leaving for anu.edu.au is the browser's business, not ours.
      if (destination.origin !== window.location.origin) return;
      // Re-clicking where you already are produces no navigation to wait for.
      if (
        destination.pathname === window.location.pathname &&
        destination.search === window.location.search
      ) {
        return;
      }
      begin();
    }

    function onSubmit(event: Event) {
      if (event.defaultPrevented) return;
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      // The sort control is a GET form, which the browser navigates itself.
      if (form.method.toLowerCase() !== "get") return;
      begin();
    }

    // Capture phase, so this runs before anything downstream can stop propagation.
    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
      clearTimers();
    };
  }, []);

  // The new page has committed. Skipping the first run matters: this effect also fires
  // on mount, and without the guard a full page load would cancel a beam it never started.
  useEffect(() => {
    if (!settled.current) {
      settled.current = true;
      return;
    }
    if (appearTimer.current !== null) window.clearTimeout(appearTimer.current);
    if (giveUpTimer.current !== null) window.clearTimeout(giveUpTimer.current);
    appearTimer.current = null;
    giveUpTimer.current = null;
    setActive(false);
  }, [pathname, search]);

  return (
    <>
      <div className="pf-nav" data-active={active ? "true" : "false"} aria-hidden="true">
        <span className="pf-nav-beam" />
      </div>
      {/* The beam is decoration; this is the part a screen reader can use. It is
          polite, so it waits for a pause rather than interrupting. */}
      <span className="pf-sr" role="status" aria-live="polite">
        {active ? "Loading" : ""}
      </span>
    </>
  );
}

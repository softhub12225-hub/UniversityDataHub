/**
 * Small presentational pieces shared across the console.
 *
 * These render what they are given. `stateTone` maps a verification state to a colour and
 * is the only place that mapping exists, so a REJECTED row cannot look green on one screen
 * and red on another. It is presentation, not policy: it decides nothing about what a
 * state permits.
 */

import type { ReactNode } from "react";

export type Tone = "ok" | "error" | "warn" | "neutral";

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className="rv-badge" data-tone={tone}>
      {children}
    </span>
  );
}

/**
 * The colour for a verification / eligibility state.
 *
 * NOT_ELIGIBLE and CANDIDATE are deliberately neutral, not warnings. Everything in the
 * pilot is correctly in those states, and styling them as problems would train a reviewer
 * to ignore the colour that does mean something.
 */
export function stateTone(state: string): Tone {
  switch (state) {
    case "VERIFIED_OFFICIAL":
    case "AUTHORIZED_EXTERNAL":
    case "OFFICIAL_VERIFIED":
    case "VERIFIED":
      return "ok";
    case "REJECTED":
      return "error";
    case "NEEDS_REVIEW":
      return "warn";
    default:
      return "neutral";
  }
}

export function Panel({
  title,
  children,
  actions,
}: {
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="rv-panel">
      {title ? (
        <div className="rv-headline">
          <h2>{title}</h2>
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}

/**
 * One number.
 *
 * `expectZero` drives the colour: a count that must be zero shows green at zero and red
 * otherwise. That inversion is the point of the safety panel -- a reviewer should be able
 * to see that nothing has leaked downstream without reading any labels.
 */
export function Stat({
  label,
  value,
  expectZero = false,
}: {
  label: string;
  value: number | string;
  expectZero?: boolean;
}) {
  const zeroState = expectZero ? (Number(value) === 0 ? "expected" : "violated") : undefined;
  return (
    <div className="rv-stat" data-zero={zeroState}>
      <div className="rv-stat-value">{value}</div>
      <div className="rv-stat-label">{label}</div>
    </div>
  );
}

export function Facts({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="rv-facts">
      {rows.map(([term, value]) => (
        <div key={term} style={{ display: "contents" }}>
          <dt>{term}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Mono({ children }: { children: ReactNode }) {
  return <span className="rv-mono">{children}</span>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rv-empty">{children}</p>;
}

/**
 * What a console screen shows while its data is in flight.
 *
 * This replaced a bare `<Empty>Loading…</Empty>`, which was a dashed box with a word
 * in it. That was fine when the API was on localhost. It is not fine now: the console
 * reads through the BFF to Railway to Neon, and a Neon compute that has scaled to zero
 * takes seconds to answer the first request -- long enough that a single line of text
 * reads as a page that has finished loading and has nothing to show.
 *
 * `rows` should be roughly what the screen is about to render, so the real content
 * lands in a space that is already its shape.
 */
export function Loading({ rows = 3, label }: { rows?: number; label?: string }) {
  return (
    <div className="rv-loading" aria-busy="true">
      {/* The blocks are decoration; this is what is actually announced, and it is
          polite so it waits for a pause rather than cutting in. */}
      <span className="rv-sr" role="status" aria-live="polite">
        {label ?? "Loading"}
      </span>
      <span className="rv-skel rv-skel-head" />
      {Array.from({ length: rows }, (_, row) => (
        <span key={row} className="rv-skel rv-skel-row" />
      ))}
    </div>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p className="rv-error" role="alert">
      {children}
    </p>
  );
}

/** A host and the authority the server reported for it. Never recomputed here. */
export function HostAuthority({ host, authority }: { host: string; authority: string }) {
  return (
    <span className="rv-inline-list">
      <Mono>{host}</Mono>
      <Badge tone={authority.startsWith("VERIFIED_OFFICIAL") && !authority.includes("INACTIVE") ? "ok" : "error"}>
        {authority}
      </Badge>
    </span>
  );
}

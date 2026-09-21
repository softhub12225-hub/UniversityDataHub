/**
 * Reviewer sign-in.
 *
 * The password goes into one fetch and is never stored, never put in a URL, never logged
 * and never held in state beyond the submit. The response carries no token for script to
 * keep: the session arrives as an HttpOnly cookie the backend set, which this page cannot
 * read and does not need to.
 *
 * Failures are reported with the backend's own message, which is deliberately identical
 * for "no such account" and "wrong password" -- distinguishing them here would rebuild the
 * account-enumeration oracle the backend refuses to be.
 *
 * WHY THE LEFT PANEL SAYS WHAT IT SAYS
 * ====================================
 * A sign-in screen for an internal tool is the one page an outsider can always reach, so
 * it is also the page that has to be honest about what is behind it. The three lines are
 * the console's actual guarantees -- verification before publication, a named reviewer on
 * every decision, an append-only audit trail -- not a value proposition. And it states
 * that accounts come from an administrator, because there is no self sign-up endpoint and
 * a visitor hunting for one should be told rather than left looking.
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Seal } from "@/components/review/seal";
import { reviewApi } from "@/lib/review/client";

const ASSURANCES: readonly string[] = [
  "No figure is published without a verified official source.",
  "Every decision is recorded against the reviewer who made it.",
  "The evidence trail is append-only and can be read back in full.",
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await reviewApi.login(email, password);
      setPassword("");
      router.replace("/review");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Sign-in failed");
      setPassword("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rv-auth">
      <section className="rv-auth-brand">
        <span className="rv-auth-mark">
          <Seal size={22} />
        </span>
        <h1 className="rv-auth-title">Reviewer console</h1>
        <p className="rv-auth-lede">
          The internal surface where official sources are verified and data is approved
          for publication.
        </p>
        <ul className="rv-auth-list">
          {ASSURANCES.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <span className="rv-auth-note">
          Accounts are issued by an administrator. There is no self sign-up.
        </span>
      </section>

      <section className="rv-auth-form">
        <div className="rv-auth-head">
          <h2>Sign in</h2>
          <p className="rv-sub">Use the reviewer account issued to you.</p>
        </div>

        <form onSubmit={submit} noValidate={false}>
          <div className="rv-field">
            <label htmlFor="rv-email">Email</label>
            <input
              id="rv-email"
              className="rv-input"
              type="email"
              autoComplete="username"
              autoFocus
              required
              disabled={busy}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="rv-field">
            <label htmlFor="rv-password">Password</label>
            <input
              id="rv-password"
              className="rv-input"
              type="password"
              autoComplete="current-password"
              required
              disabled={busy}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {/* The region exists before there is an error, so a screen reader announces
              the failure when it arrives rather than only on the next focus move. */}
          <div className="rv-auth-error" role="alert" aria-live="polite">
            {error ? <span>{error}</span> : null}
          </div>

          <button className="rv-button rv-auth-submit" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <Link className="rv-auth-back" href="/">
          Back to the public platform
        </Link>
      </section>
    </div>
  );
}

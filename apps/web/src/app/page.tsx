import Link from "next/link";

import { appEnv } from "@/lib/config/env";

export default function HomePage() {
  return (
    <>
      <h1>University DataHub</h1>
      <p className="muted">
        Internal data management and verification platform. Environment:{" "}
        <code>{appEnv()}</code>
      </p>

      {/*
        The console comes first on this page, because it is the only thing anyone
        opens this site to use. This card used to say "Bootstrap stage -- no
        university, program or admissions functionality exists yet", which was true
        when it was written and had been wrong for a long time by the point somebody
        opened the deployed site and asked where the login was.
      */}
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Reviewer console</h2>
        <p>
          Source verification and candidate review for the university data set: the
          trust root, the stored evidence behind every source, and the scope and
          conflict decisions that gate publication.
        </p>
        <p>
          <Link href="/review">Open the console</Link> — or go straight to{" "}
          <Link href="/review/login">sign in</Link>. A reviewer account is required;
          there is no public access and no self-registration.
        </p>
      </div>

      <h2>What the console does</h2>
      <ul>
        <li>
          Verifies that a host is official for an institution, and that a page on it
          actually carries the responsibility claimed for it
        </li>
        <li>
          Shows the stored snapshot a decision rests on, and never refetches — a
          reviewer judges what the system holds, not what the site says today
        </li>
        <li>
          Resolves applicant scope and conflicting values by hand. Nothing infers a
          winner, and an unstated scope is never treated as universal
        </li>
        <li>
          Previews every operation before it happens, and refuses a confirmation if
          anything changed after the preview was read
        </li>
        <li>
          Records each decision against its reviewer in a hash-chained audit trail
        </li>
      </ul>

      <p className="muted">
        Nothing is published yet: publication is gated on a verified source, an
        accepted candidate review, a resolved scope, and an independent publisher.{" "}
        <Link href="/system-status">System status</Link> checks that the backend and
        its dependencies are reachable.
      </p>
    </>
  );
}

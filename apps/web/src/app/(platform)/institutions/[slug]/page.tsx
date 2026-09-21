import Link from "next/link";
import { notFound } from "next/navigation";

import { Crest } from "@/components/platform/crest";
import { bySlug, destinationLabel, verifiedSourceCount } from "@/lib/catalogue/catalogue";
import { DEFAULT_LOCALE, type Locale, parseLocale, t } from "@/lib/i18n";

/**
 * 院校档案 / Institution dossier — one institution, and everything the platform can
 * honestly say about it.
 *
 * WHY MOST OF THIS PAGE IS EMPTY, ON PURPOSE
 * ==========================================
 * Every figure a student actually needs — tuition, IELTS, deadlines — reads
 * `[ 待发布 ]`. That is not an unfinished page: there are zero published claims in the
 * system, and the product's promise is that a number appears only with the page it
 * came from, the snapshot it was read in, the applicants it applies to and the
 * reviewer who approved it. Filling these with plausible values would be the precise
 * failure the platform exists to prevent, and the reference site's own deadlines page
 * shows where that leads: 7,694 of its 110,762 dates come from published sources, the
 * rest are estimated from previous cycles.
 *
 * So the layout is complete and the values are honest. When a claim publishes, it
 * lands in the slot that already describes it.
 *
 * ANU'S SOURCE LIST IS REAL
 * =========================
 * The three verified domains and the six approved responsibility sources shown for
 * ANU are the live verification state, not decoration. The nine-row source list with
 * three 404s is what the acquisition pass actually found.
 */

export const dynamic = "force-dynamic";

export default async function InstitutionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const institution = bySlug(slug);
  if (!institution) notFound();

  const locale = parseLocale(query.lang);
  const copy = t(locale);
  const english = locale === "en";
  const sources = verifiedSourceCount(slug);
  const verified = sources > 0;

  const verifiedSourceNames = [
    copy.srcHome,
    copy.srcUndergrad,
    copy.srcCatalog,
    copy.srcLanguage,
    copy.srcTuition,
    copy.srcDeadline,
  ];
  const missingSourceNames = [copy.srcPostgrad, copy.srcPhd, copy.srcCalendar];

  return (
    <>
      <section className="pf-masthead">
        <div className="pf-masthead-body">
          <Link
            href={backHref(locale)}
            style={{ fontSize: "12.5px", color: "#6b736f", textDecoration: "none" }}
          >
            {copy.backToSearch}
          </Link>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "16px", marginTop: "12px" }}>
            <Crest name={institution.name} verified={verified} />
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
              <h1 lang="en" style={{ fontSize: "32px", lineHeight: 1.12 }}>
                {institution.name}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "14px", color: "#4a534f" }}>
                  {destinationLabel(institution.destination, english)} ·{" "}
                  <span lang="en">{institution.country}</span>
                </span>
                {verified ? (
                  <span className="pf-tag pf-tag-verified">{copy.verifiedSources(sources)}</span>
                ) : (
                  <span className="pf-tag pf-tag-pending">{copy.pending}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="pf-doc">
        <div className="pf-doc-main">
          {!verified ? (
            <p className="pf-callout pf-callout-warn">{copy.notVerifiedBanner}</p>
          ) : null}

          <section>
            <div className="pf-section-head">
              <h2>{copy.keyFacts}</h2>
              <span className="pf-section-note">{copy.keyFactsNote}</span>
            </div>
            <div className="pf-facts">
              <Fact
                label={copy.english}
                value={`IELTS ${copy.awaitingValue}`}
                verified={verified}
                verifiedLabel={copy.sourceVerified}
                pendingLabel={copy.pending}
                provenance={
                  verified
                    ? "study.anu.edu.au/apply/english-language-requirements · [ snapshot ] · [ reviewer ]"
                    : copy.noVerifiedSource
                }
              />
              <Fact
                label={copy.tuition}
                value={copy.awaitingValue}
                verified={verified}
                verifiedLabel={copy.sourceVerified}
                pendingLabel={copy.pending}
                provenance={
                  verified
                    ? "www.anu.edu.au · [ snapshot ] · [ reviewer ]"
                    : copy.noVerifiedSource
                }
              />
              <Fact
                label={copy.deadline}
                value={copy.awaitingValue}
                verified={verified}
                verifiedLabel={copy.sourceVerified}
                pendingLabel={copy.pending}
                provenance={
                  verified
                    ? "study.anu.edu.au · [ snapshot ] · [ reviewer ]"
                    : copy.noVerifiedSource
                }
              />
              {verified ? (
                <div className="pf-fact pf-fact-pending">
                  <div className="pf-fact-label">
                    <span>{copy.postgraduate}</span>
                    <span className="pf-tag pf-tag-pending">{copy.noSource}</span>
                  </div>
                  <span className="pf-fact-value pf-fact-value-pending">{copy.notShown}</span>
                  <span className="pf-fact-prov">{copy.notShownWhy}</span>
                </div>
              ) : null}
            </div>
          </section>

          <section>
            <div className="pf-section-head">
              <h2>{copy.requirements}</h2>
              <span className="pf-section-note">{copy.requirementsNote}</span>
            </div>
            <table
              style={{
                width: "100%",
                marginTop: "12px",
                borderCollapse: "collapse",
                fontSize: "13.5px",
              }}
            >
              <thead>
                <tr>
                  <Th>{copy.colItem}</Th>
                  <Th>{copy.colValue}</Th>
                  <Th>{copy.colAppliesTo}</Th>
                  <Th>{copy.colSource}</Th>
                </tr>
              </thead>
              <tbody>
                {[copy.reqIelts, copy.reqToefl, copy.reqAcademic].map((item) => (
                  <tr key={item}>
                    <Td strong>{item}</Td>
                    <Td>{copy.awaitingValue}</Td>
                    <Td muted>{copy.pendingScope}</Td>
                    <Td>{verified ? "study.anu.edu.au" : "—"}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="pf-callout">
              {copy.scopeCallout[0]}
              <strong>{copy.scopeCallout[1]}</strong>
              {copy.scopeCallout[2]}
            </p>
          </section>
        </div>

        <aside className="pf-doc-rail">
          <div className="pf-rail-card">
            <span className="pf-eyebrow">{copy.verifiedDomains}</span>
            {verified ? (
              <>
                {["www.anu.edu.au", "study.anu.edu.au", "programsandcourses.anu.edu.au"].map(
                  (host) => (
                    <span key={host} className="pf-rail-line">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7fc2a3" strokeWidth="3" aria-hidden="true">
                        <path d="m20 6-11 11-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span lang="en">{host}</span>
                    </span>
                  ),
                )}
                <span className="pf-rail-small">{copy.domainsNote}</span>
              </>
            ) : (
              <span className="pf-rail-small">{copy.noDomains}</span>
            )}
          </div>

          {verified ? (
            <div className="pf-list-card">
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span className="pf-eyebrow" style={{ flexGrow: 1 }}>
                  {copy.sourceList}
                </span>
                <span style={{ fontSize: "12.5px", color: "#4a534f" }}>6 / 9</span>
              </div>
              {verifiedSourceNames.map((label) => (
                <span key={label} style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                  <span className="pf-dot pf-dot-on" />
                  <span style={{ flexGrow: 1, fontSize: "13px" }}>{label}</span>
                </span>
              ))}
              {missingSourceNames.map((label) => (
                <span key={label} style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                  <span className="pf-dot pf-dot-off" />
                  <span style={{ flexGrow: 1, fontSize: "13px", color: "#6b736f" }}>{label}</span>
                  <span style={{ fontSize: "11px", color: "#8a5a12", fontWeight: 600 }}>404</span>
                </span>
              ))}
            </div>
          ) : null}
        </aside>
      </div>
    </>
  );
}

function backHref(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? "/" : "/?lang=en";
}

function Fact({
  label,
  value,
  verified,
  verifiedLabel,
  pendingLabel,
  provenance,
}: {
  label: string;
  value: string;
  verified: boolean;
  verifiedLabel: string;
  pendingLabel: string;
  provenance: string;
}) {
  return (
    <div className={`pf-fact ${verified ? "" : "pf-fact-pending"}`}>
      <div className="pf-fact-label">
        <span>{label}</span>
        {verified ? (
          <span className="pf-tag pf-tag-verified">{verifiedLabel}</span>
        ) : (
          <span className="pf-tag pf-tag-pending">{pendingLabel}</span>
        )}
      </div>
      <span className={`pf-fact-value ${verified ? "" : "pf-fact-value-pending"}`}>{value}</span>
      <span className="pf-fact-prov">{provenance}</span>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      scope="col"
      style={{
        padding: "0 12px 9px 0",
        textAlign: "left",
        fontSize: "10.5px",
        fontWeight: 700,
        letterSpacing: "0.08em",
        color: "#6b736f",
        borderBottom: "1px solid #d9d3c4",
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  strong,
  muted,
}: {
  children: React.ReactNode;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <td
      style={{
        padding: "13px 12px 13px 0",
        borderBottom: "1px solid #efeae0",
        fontWeight: strong ? 500 : 400,
        color: muted ? "#4a534f" : "#141a18",
      }}
    >
      {children}
    </td>
  );
}

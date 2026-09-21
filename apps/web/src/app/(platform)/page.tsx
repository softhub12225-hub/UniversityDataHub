import Link from "next/link";

import { Crest } from "@/components/platform/crest";
import { MastheadPlate } from "@/components/platform/masthead-plate";
import {
  type SortKey,
  type VerificationState,
  destinationLabel,
  search,
  source,
  total,
  verifiedSourceCount,
} from "@/lib/catalogue/catalogue";
import { DEFAULT_LOCALE, type Locale, parseLocale, t } from "@/lib/i18n";

/**
 * 院校检索 / Institution search — the platform's front door.
 *
 * WHY THE CATALOGUE IS THE HOME PAGE
 * ==================================
 * There is no marketing landing page. The reference portals need one because their
 * home page has to sell a search over 500,000 programmes; this catalogue is 181
 * institutions across eight destinations, and the useful thing to show first is the
 * catalogue itself, already filtered by whatever the URL says.
 *
 * WHY EVERY CONTROL IS A LINK OR A PLAIN FORM
 * ===========================================
 * Filters are `<a href>`, search and sort are GET forms, and this is a server
 * component. The URL is therefore the entire state — including the language — so every
 * result set is linkable and reloadable, the count in the header is computed by the
 * same code that chose the rows, and nothing can drift between what the client thinks
 * is filtered and what the server returned. It is also what the future API call looks
 * like: query in, page plus facets out.
 */

export const dynamic = "force-dynamic";

type Params = Record<string, string | string[] | undefined>;

function many(params: Params, key: string): string[] {
  const raw = params[key];
  if (raw === undefined) return [];
  return (Array.isArray(raw) ? raw : [raw]).filter((value) => value.length > 0);
}

function one(params: Params, key: string): string {
  const raw = params[key];
  return (Array.isArray(raw) ? raw[0] : raw) ?? "";
}

/**
 * Rebuild the URL from the current state with `changes` applied.
 *
 * One builder for every control, so the locale, the query, the sort and the filters
 * cannot be dropped by one link and kept by another — which is exactly the bug a
 * handful of bespoke href templates produces.
 */
function urlFor(
  params: Params,
  locale: Locale,
  changes: {
    toggleDest?: string;
    toggleState?: string;
    clearQuery?: boolean;
    page?: number;
  } = {},
): string {
  const next = new URLSearchParams();

  const q = changes.clearQuery ? "" : one(params, "q");
  if (q) next.set("q", q);

  const sort = one(params, "sort");
  if (sort) next.set("sort", sort);

  const destinations = many(params, "dest");
  const updatedDest = changes.toggleDest
    ? destinations.includes(changes.toggleDest)
      ? destinations.filter((item) => item !== changes.toggleDest)
      : [...destinations, changes.toggleDest]
    : destinations;
  for (const item of updatedDest) next.append("dest", item);

  const states = many(params, "state");
  const updatedState = changes.toggleState
    ? states.includes(changes.toggleState)
      ? states.filter((item) => item !== changes.toggleState)
      : [...states, changes.toggleState]
    : states;
  for (const item of updatedState) next.append("state", item);

  // A new filter always starts on page 1: keeping page 7 while narrowing the set to
  // three results shows an empty page, which reads as "no matches".
  const page = changes.page ?? (changes.toggleDest || changes.toggleState ? 1 : 0);
  if (page > 1) next.set("page", String(page));

  if (locale !== DEFAULT_LOCALE) next.set("lang", locale);

  const query = next.toString();
  return query ? `/?${query}` : "/";
}

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const params = await searchParams;
  const locale = parseLocale(params.lang);
  const copy = t(locale);
  const english = locale === "en";

  const q = one(params, "q");
  const destinations = many(params, "dest");
  const stateFilter = many(params, "state").filter(
    (value): value is VerificationState => value === "verified" || value === "pending",
  );
  const sort = (one(params, "sort") || "verified") as SortKey;
  const page = Number.parseInt(one(params, "page") || "1", 10) || 1;

  const result = search({ q, destinations, verification: stateFilter, sort, page });
  const filtered = Boolean(q) || destinations.length > 0 || stateFilter.length > 0;
  const [matchedBefore, matchedAfter] = copy.matched(result.matched);

  const sorts: readonly { value: SortKey; label: string }[] = [
    { value: "verified", label: copy.sortVerified },
    { value: "name", label: copy.sortName },
    { value: "destination", label: copy.sortDestination },
  ];

  return (
    <>
      <section className="pf-masthead">
        <div className="pf-masthead-body">
          <h1>{copy.title}</h1>
          <p className="pf-colophon">
            {copy.colophonCount(total)} {copy.colophonRank}
          </p>
          <p className="pf-colophon">
            {copy.colophonSource(source.upstream, source.publishedAt)}
          </p>
        </div>
        <div className="pf-plate">
          <MastheadPlate />
          <span className="pf-plate-note">{copy.platePlaceholder}</span>
        </div>
      </section>

      <div className="pf-body">
        <aside className="pf-facets">
          <div className="pf-facet-head">
            <span className="pf-eyebrow">{copy.filters}</span>
            <span className="pf-hr" />
            {filtered ? (
              <Link
                href={locale === DEFAULT_LOCALE ? "/" : "/?lang=en"}
                style={{ fontSize: "12.5px" }}
              >
                {copy.clear}
              </Link>
            ) : null}
          </div>

          {/* Verification first: it is the facet no comparable platform offers. */}
          <fieldset className="pf-facet pf-facet-primary">
            <legend>{copy.verification}</legend>
            <div className="pf-facet-list">
              {result.verificationFacets.map((facet) => (
                <Link
                  key={facet.value}
                  className="pf-check"
                  href={urlFor(params, locale, { toggleState: facet.value })}
                  aria-pressed={facet.selected}
                >
                  <input type="checkbox" checked={facet.selected} readOnly tabIndex={-1} />
                  <span className="pf-check-label">
                    {facet.value === "verified" ? copy.verified : copy.pending}
                  </span>
                  <span
                    className={`pf-count ${
                      facet.value === "verified" ? "pf-count-verified" : "pf-count-pending"
                    }`}
                  >
                    {facet.count}
                  </span>
                </Link>
              ))}
            </div>
            <p className="pf-facet-note">{copy.verificationNote}</p>
          </fieldset>

          <fieldset className="pf-facet">
            <legend>{copy.destination}</legend>
            <div className="pf-facet-list">
              {result.destinationFacets.map((facet) => (
                <Link
                  key={facet.value}
                  className="pf-check"
                  href={urlFor(params, locale, { toggleDest: facet.value })}
                  aria-pressed={facet.selected}
                >
                  <input type="checkbox" checked={facet.selected} readOnly tabIndex={-1} />
                  <span className="pf-check-label">
                    {destinationLabel(facet.value, english)}
                  </span>
                  <span className="pf-count">{facet.count}</span>
                </Link>
              ))}
            </div>
          </fieldset>

          {/* Programme-level facets are named but inert: there are no published
              programmes, and a filter that silently returns everything is worse
              than one that says it is not ready. */}
          <fieldset className="pf-facet" aria-describedby="pf-inert">
            <legend>{copy.level}</legend>
            <div className="pf-facet-list">
              {[copy.levelBachelor, copy.levelMaster, copy.levelPhd, copy.levelFoundation].map(
                (label) => (
                  <span key={label} className="pf-check" style={{ color: "#8a9490" }}>
                    <input type="checkbox" disabled />
                    <span className="pf-check-label">{label}</span>
                    <span className="pf-count" style={{ color: "#a8a197" }}>
                      —
                    </span>
                  </span>
                ),
              )}
            </div>
          </fieldset>

          <p className="pf-notice" id="pf-inert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a5a12" strokeWidth="1.9" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8h.01M12 11v5" strokeLinecap="round" />
            </svg>
            <span>{copy.inertNote}</span>
          </p>
        </aside>

        <section className="pf-results">
          <div className="pf-controls">
            <div className="pf-scope">
              <span className="pf-on">
                {copy.scopeInstitutions} {total}
              </span>
              <span className="pf-off">{copy.scopeProgrammes} 0</span>
            </div>
            <span className="pf-tally">
              {filtered ? copy.filteredPrefix : ""}
              {matchedBefore}
              <strong>{result.matched}</strong>
              {matchedAfter}
            </span>

            <form
              action="/"
              method="get"
              style={{ display: "flex", gap: "8px", alignItems: "center" }}
            >
              {q ? <input type="hidden" name="q" value={q} /> : null}
              {destinations.map((value) => (
                <input key={value} type="hidden" name="dest" value={value} />
              ))}
              {stateFilter.map((value) => (
                <input key={value} type="hidden" name="state" value={value} />
              ))}
              {locale !== DEFAULT_LOCALE ? (
                <input type="hidden" name="lang" value={locale} />
              ) : null}
              <label htmlFor="pf-sort" style={{ fontSize: "13px", color: "#6b736f" }}>
                {copy.sort}
              </label>
              <select id="pf-sort" name="sort" defaultValue={sort} className="pf-select">
                {sorts.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button type="submit" className="pf-page">
                {copy.apply}
              </button>
            </form>
          </div>

          {filtered ? (
            <div className="pf-chips">
              {q ? (
                <Link className="pf-chip" href={urlFor(params, locale, { clearQuery: true })}>
                  {english ? `“${q}”` : `「${q}」`}
                  <Cross />
                </Link>
              ) : null}
              {destinations.map((value) => (
                <Link
                  key={value}
                  className="pf-chip"
                  href={urlFor(params, locale, { toggleDest: value })}
                >
                  {destinationLabel(value, english)}
                  <Cross />
                </Link>
              ))}
              {stateFilter.map((value) => (
                <Link
                  key={value}
                  className={`pf-chip ${value === "verified" ? "pf-chip-verified" : ""}`}
                  href={urlFor(params, locale, { toggleState: value })}
                >
                  {value === "verified" ? copy.verified : copy.pending}
                  <Cross />
                </Link>
              ))}
            </div>
          ) : null}

          {result.institutions.length === 0 ? (
            <div className="pf-empty">
              <span style={{ flexGrow: 1, fontSize: "14px", color: "#4a534f" }}>
                {copy.noResults(total)}{" "}
                <Link href={locale === DEFAULT_LOCALE ? "/" : "/?lang=en"}>
                  {copy.showAll} {total}
                </Link>
                。
              </span>
            </div>
          ) : (
            result.institutions.map((institution) => {
              const sources = verifiedSourceCount(institution.slug);
              const verified = sources > 0;
              const dossier =
                locale === DEFAULT_LOCALE
                  ? `/institutions/${institution.slug}`
                  : `/institutions/${institution.slug}?lang=en`;
              return (
                <article
                  key={institution.slug}
                  className={`pf-result ${verified ? "pf-result-verified" : ""}`}
                >
                  <div className="pf-result-bar" />
                  <div className="pf-result-main">
                    <Crest name={institution.name} verified={verified} />
                    <div className="pf-result-text">
                      <div className="pf-result-title">
                        <Link href={dossier} lang="en">
                          {institution.name}
                        </Link>
                        {verified ? (
                          <span className="pf-tag pf-tag-verified">
                            <Tick />
                            {copy.verifiedSources(sources)}
                          </span>
                        ) : (
                          <span className="pf-tag pf-tag-pending">{copy.pending}</span>
                        )}
                      </div>
                      <span className="pf-where">
                        {destinationLabel(institution.destination, english)} ·{" "}
                        <span lang="en">{institution.country}</span>
                      </span>

                      <div className="pf-prov">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b736f" strokeWidth="1.9" aria-hidden="true">
                          <rect x="3" y="4" width="18" height="16" rx="1.5" />
                          <path d="M3 9h18M8 13h8" strokeLinecap="round" />
                        </svg>
                        <span className="pf-prov-text">
                          {verified ? copy.provVerified : copy.provPending}
                        </span>
                      </div>
                    </div>
                    <div className="pf-result-actions">
                      <Link className="pf-btn pf-btn-solid" href={dossier}>
                        {copy.viewDossier}
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })
          )}

          {result.pages > 1 ? (
            <nav className="pf-pager" aria-label={copy.sort}>
              <span className="pf-pager-tally">
                {copy.pagerTally(result.matched, result.perPage, result.page, result.pages)}
              </span>
              {result.page > 1 ? (
                <Link className="pf-page" href={urlFor(params, locale, { page: result.page - 1 })}>
                  {copy.prev}
                </Link>
              ) : (
                <span className="pf-page pf-page-off">{copy.prev}</span>
              )}
              {pageWindow(result.page, result.pages).map((number) => (
                <Link
                  key={number}
                  className={`pf-page ${number === result.page ? "pf-page-on" : ""}`}
                  href={urlFor(params, locale, { page: number })}
                  aria-current={number === result.page ? "page" : undefined}
                >
                  {number}
                </Link>
              ))}
              {result.page < result.pages ? (
                <Link className="pf-page" href={urlFor(params, locale, { page: result.page + 1 })}>
                  {copy.next}
                </Link>
              ) : (
                <span className="pf-page pf-page-off">{copy.next}</span>
              )}
            </nav>
          ) : null}
        </section>
      </div>
    </>
  );
}

/** A short window of page numbers — 181 institutions is 10 pages, 700+ will be 35+. */
function pageWindow(page: number, pages: number): number[] {
  const span = 5;
  let start = Math.max(1, page - Math.floor(span / 2));
  const end = Math.min(pages, start + span - 1);
  start = Math.max(1, end - span + 1);
  const window: number[] = [];
  for (let number = start; number <= end; number += 1) window.push(number);
  return window;
}

function Cross() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

function Tick() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <path d="m20 6-11 11-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

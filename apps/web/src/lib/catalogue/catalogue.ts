/**
 * The institution catalogue: what the platform covers, and how search queries it.
 *
 * WHERE THE DATA COMES FROM, AND WHERE IT IS GOING
 * ================================================
 * `institutions.json` is generated from the client's workbook
 * (`QS_2027_世界前500_指定地区院校.xlsx`) — 181 institutions, QS 2027 rank ≤ 500,
 * restricted to eight destinations. It is committed rather than fetched because the
 * catalogue is editorial: it defines coverage, changes once a cycle, and must not
 * differ between a build and a request.
 *
 * It is NOT the long-term home. The canonical `university` table exists in the API's
 * schema and this module is deliberately shaped like the API call that will replace
 * it: `search()` takes a query object and returns a page plus facet counts, exactly
 * what an endpoint would return. When the catalogue lands in Postgres, this file's
 * body changes and nothing that calls it does.
 *
 * RANK IS ABSENT ON PURPOSE
 * =========================
 * The workbook carries `QS rank` and `overall score`. The generator reads them and
 * throws them away. Choosing which institutions to cover by rank is an editorial
 * decision; publishing rank and score is redistribution of QS's data, and
 * `RANKINGS_ENABLED` is false. So there is no rank field to sort or filter by, and
 * no way for a page to leak one by accident.
 *
 * SEARCH RUNS ON THE SERVER
 * =========================
 * Every function here is called from server components. Filtering a client-side
 * array would make the count on screen and the set the server would act on capable
 * of disagreeing, and would not survive the move to a real endpoint.
 */

import data from "./institutions.json";

export interface Institution {
  readonly slug: string;
  /** The QS official English name. Displayed as published, never translated. */
  readonly name: string;
  /** The destination as the client's workbook names it, in Chinese. */
  readonly destination: string;
  readonly destinationEn: string;
  readonly destinationCode: string;
  /** QS's own Country/Territory string, which can differ from the destination. */
  readonly country: string;
}

export interface CatalogueSource {
  readonly workbook: string;
  readonly upstream: string;
  readonly publishedAt: string;
  readonly filter: string;
  readonly note: string;
}

const CATALOGUE = data.institutions as readonly Institution[];

export const source: CatalogueSource = data.source as CatalogueSource;
export const total = CATALOGUE.length;

/**
 * Which institutions have a verified source, and how many.
 *
 * Today this is the one real answer the verification plane can give: ANU has three
 * verified domains and six approved responsibility sources; nothing else has been
 * verified at all. It is hard-coded here, and that is a deliberate placeholder —
 * flagged, not hidden — until the API exposes verification state per institution.
 *
 * It matters that this is honest rather than optimistic: the whole product promise is
 * that an unverified figure is shown as absent, so the count of verified institutions
 * must never be inflated to make a demo look fuller.
 */
const VERIFIED: Readonly<Record<string, number>> = {
  "australian-national-university-anu": 6,
};

export function verifiedSourceCount(slug: string): number {
  return VERIFIED[slug] ?? 0;
}

export type VerificationState = "verified" | "pending";

export function verificationState(slug: string): VerificationState {
  return verifiedSourceCount(slug) > 0 ? "verified" : "pending";
}

/** Sorts a search offers. No rank option exists, by design — see the file header. */
export type SortKey = "name" | "destination" | "verified";

export interface SearchQuery {
  /** Free text, matched against the institution name. */
  readonly q?: string;
  /** Destination names as the workbook spells them, e.g. 澳大利亚. */
  readonly destinations?: readonly string[];
  readonly verification?: readonly VerificationState[];
  readonly sort?: SortKey;
  readonly page?: number;
  readonly perPage?: number;
}

export interface FacetOption {
  readonly value: string;
  readonly label: string;
  /** How many institutions this option would return, given the OTHER filters. */
  readonly count: number;
  readonly selected: boolean;
}

export interface SearchResult {
  readonly institutions: readonly Institution[];
  /** Matching the full query — the number the pager and the header both use. */
  readonly matched: number;
  readonly page: number;
  readonly perPage: number;
  readonly pages: number;
  readonly destinationFacets: readonly FacetOption[];
  readonly verificationFacets: readonly FacetOption[];
}

const DEFAULT_PER_PAGE = 20;

/** Destination order: by catalogue size, so the biggest coverage reads first. */
const DESTINATION_ORDER: readonly string[] = [
  "美国",
  "英国",
  "澳大利亚",
  "加拿大",
  "新西兰",
  "中国香港",
  "新加坡",
  "中国澳门",
];

/**
 * The English label for a destination.
 *
 * Facets key on the destination exactly as the client's workbook spells it, in
 * Chinese, because that string is the filter value and must survive round-tripping
 * through the URL unchanged. The English side of the interface still has to render
 * it, so the pairing lives here rather than being re-derived per institution.
 */
const DESTINATION_EN: Readonly<Record<string, string>> = {
  美国: "United States",
  英国: "United Kingdom",
  澳大利亚: "Australia",
  加拿大: "Canada",
  新西兰: "New Zealand",
  中国香港: "Hong Kong SAR",
  新加坡: "Singapore",
  中国澳门: "Macao SAR",
};

export function destinationLabel(name: string, english: boolean): string {
  return english ? (DESTINATION_EN[name] ?? name) : name;
}

function matchesText(institution: Institution, q: string): boolean {
  if (!q) return true;
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return (
    institution.name.toLowerCase().includes(needle) ||
    institution.destination.includes(needle) ||
    institution.destinationEn.toLowerCase().includes(needle) ||
    institution.country.toLowerCase().includes(needle)
  );
}

function matchesDestination(institution: Institution, chosen: readonly string[]): boolean {
  return chosen.length === 0 || chosen.includes(institution.destination);
}

function matchesVerification(
  institution: Institution,
  chosen: readonly VerificationState[],
): boolean {
  return chosen.length === 0 || chosen.includes(verificationState(institution.slug));
}

export function search(query: SearchQuery): SearchResult {
  const q = query.q ?? "";
  const destinations = query.destinations ?? [];
  const verification = query.verification ?? [];
  const perPage = query.perPage ?? DEFAULT_PER_PAGE;

  const matching = CATALOGUE.filter(
    (institution) =>
      matchesText(institution, q) &&
      matchesDestination(institution, destinations) &&
      matchesVerification(institution, verification),
  );

  // Facet counts exclude their OWN dimension. Counting with the dimension applied
  // would show 0 against every unselected destination the moment one was chosen,
  // which reads as "no results there" when it means "not currently selected" —
  // and that misreading is the whole reason faceted search shows counts at all.
  const forDestinationFacets = CATALOGUE.filter(
    (institution) =>
      matchesText(institution, q) && matchesVerification(institution, verification),
  );
  const forVerificationFacets = CATALOGUE.filter(
    (institution) => matchesText(institution, q) && matchesDestination(institution, destinations),
  );

  const destinationFacets: FacetOption[] = DESTINATION_ORDER.map((name) => ({
    value: name,
    label: name,
    count: forDestinationFacets.filter((i) => i.destination === name).length,
    selected: destinations.includes(name),
  }));

  const verificationFacets: FacetOption[] = (
    [
      { value: "verified", label: "已核验来源" },
      { value: "pending", label: "待核验" },
    ] as const
  ).map((option) => ({
    value: option.value,
    label: option.label,
    count: forVerificationFacets.filter((i) => verificationState(i.slug) === option.value)
      .length,
    selected: verification.includes(option.value),
  }));

  const sorted = [...matching].sort(comparator(query.sort ?? "name"));

  const pages = Math.max(1, Math.ceil(sorted.length / perPage));
  const page = Math.min(Math.max(1, query.page ?? 1), pages);
  const start = (page - 1) * perPage;

  return {
    institutions: sorted.slice(start, start + perPage),
    matched: sorted.length,
    page,
    perPage,
    pages,
    destinationFacets,
    verificationFacets,
  };
}

function comparator(sort: SortKey): (a: Institution, b: Institution) => number {
  const byName = (a: Institution, b: Institution) => a.name.localeCompare(b.name, "en");
  switch (sort) {
    case "destination":
      return (a, b) => {
        const delta =
          DESTINATION_ORDER.indexOf(a.destination) - DESTINATION_ORDER.indexOf(b.destination);
        return delta !== 0 ? delta : byName(a, b);
      };
    case "verified":
      // Verified first, then by name. Within "verified", more approved sources first,
      // because that is a fact about the evidence rather than a quality judgement.
      return (a, b) => {
        const delta = verifiedSourceCount(b.slug) - verifiedSourceCount(a.slug);
        return delta !== 0 ? delta : byName(a, b);
      };
    case "name":
    default:
      return byName;
  }
}

export function bySlug(slug: string): Institution | undefined {
  return CATALOGUE.find((institution) => institution.slug === slug);
}

export function allSlugs(): readonly string[] {
  return CATALOGUE.map((institution) => institution.slug);
}

/** Destination totals over the whole catalogue, for the masthead and empty states. */
export function destinationTotals(): readonly { name: string; count: number }[] {
  return DESTINATION_ORDER.map((name) => ({
    name,
    count: CATALOGUE.filter((institution) => institution.destination === name).length,
  }));
}

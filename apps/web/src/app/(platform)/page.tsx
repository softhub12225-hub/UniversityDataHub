import Link from "next/link";

import { MastheadPlate } from "@/components/platform/masthead-plate";
import { Crest } from "@/components/platform/crest";
import {
  type SortKey,
  type VerificationState,
  search,
  source,
  total,
  verifiedSourceCount,
} from "@/lib/catalogue/catalogue";

/**
 * 院校检索 — the platform's front door.
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
 * Filters are `<a href>`, search is a GET form, and this is a server component. The
 * URL is therefore the entire state: every result set is linkable and reloadable, the
 * count in the header is computed by the same code that chose the rows, and nothing
 * can drift between what the client thinks is filtered and what the server returned.
 * It is also what the future API call looks like — query in, page plus facets out.
 */

export const dynamic = "force-dynamic";

const SORTS: readonly { value: SortKey; label: string }[] = [
  { value: "verified", label: "已核验优先" },
  { value: "name", label: "院校名称 A–Z" },
  { value: "destination", label: "按目的地" },
];

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

/** A URL with one facet value toggled, and the page reset — a new filter starts at 1. */
function toggled(params: Params, key: string, value: string): string {
  const next = new URLSearchParams();
  const q = one(params, "q");
  if (q) next.set("q", q);
  const sort = one(params, "sort");
  if (sort) next.set("sort", sort);

  for (const facet of ["dest", "state"]) {
    const current = many(params, facet);
    const updated =
      facet === key
        ? current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value]
        : current;
    for (const item of updated) next.append(facet, item);
  }
  const query = next.toString();
  return query ? `/?${query}` : "/";
}

function atPage(params: Params, page: number): string {
  const next = new URLSearchParams();
  const q = one(params, "q");
  if (q) next.set("q", q);
  const sort = one(params, "sort");
  if (sort) next.set("sort", sort);
  for (const item of many(params, "dest")) next.append("dest", item);
  for (const item of many(params, "state")) next.append("state", item);
  if (page > 1) next.set("page", String(page));
  const query = next.toString();
  return query ? `/?${query}` : "/";
}

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const params = await searchParams;
  const q = one(params, "q");
  const destinations = many(params, "dest");
  const stateFilter = many(params, "state").filter(
    (value): value is VerificationState => value === "verified" || value === "pending",
  );
  const sort = (one(params, "sort") || "verified") as SortKey;
  const page = Number.parseInt(one(params, "page") || "1", 10) || 1;

  const result = search({ q, destinations, verification: stateFilter, sort, page });
  const filtered = Boolean(q) || destinations.length > 0 || stateFilter.length > 0;

  return (
    <>
      <section className="pf-masthead">
        <div className="pf-masthead-body">
          <h1>院校检索</h1>
          <p className="pf-colophon">
            收录 QS 2027 全球排名 ≤ 500 中位于 8 个指定地区的 <strong>{total} 所</strong>
            院校。名次仅用于确定收录范围，页面不展示排名数值或综合得分。
          </p>
          <p className="pf-colophon">
            数据来源：{source.upstream}（{source.publishedAt} 发布）
          </p>
        </div>
        <div className="pf-plate">
          <MastheadPlate />
          <span className="pf-plate-note">[ 占位图 ]</span>
        </div>
      </section>

      <div className="pf-body">
        <aside className="pf-facets">
          <div className="pf-facet-head">
            <span className="pf-eyebrow">筛选条件</span>
            <span className="pf-hr" />
            {filtered ? (
              <Link href="/" style={{ fontSize: "12.5px" }}>
                清除
              </Link>
            ) : null}
          </div>

          {/* Verification first: it is the facet no comparable platform offers. */}
          <fieldset className="pf-facet pf-facet-primary">
            <legend>数据核验</legend>
            <div className="pf-facet-list">
              {result.verificationFacets.map((facet) => (
                <Link
                  key={facet.value}
                  className="pf-check"
                  href={toggled(params, "state", facet.value)}
                  aria-pressed={facet.selected}
                >
                  <input type="checkbox" checked={facet.selected} readOnly tabIndex={-1} />
                  <span className="pf-check-label">{facet.label}</span>
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
            <p className="pf-facet-note">
              「已核验」指该院校的官网来源已由审核人确认。平台不以第三方聚合数据填补空缺。
            </p>
          </fieldset>

          <fieldset className="pf-facet">
            <legend>目的地</legend>
            <div className="pf-facet-list">
              {result.destinationFacets.map((facet) => (
                <Link
                  key={facet.value}
                  className="pf-check"
                  href={toggled(params, "dest", facet.value)}
                  aria-pressed={facet.selected}
                >
                  <input type="checkbox" checked={facet.selected} readOnly tabIndex={-1} />
                  <span className="pf-check-label">{facet.label}</span>
                  <span className="pf-count">{facet.count}</span>
                </Link>
              ))}
            </div>
          </fieldset>

          {/* Programme-level facets are named but inert: there are no published
              programmes, and a filter that silently returns everything is worse
              than one that says it is not ready. */}
          <fieldset className="pf-facet" aria-describedby="pf-inert">
            <legend>学位层次</legend>
            <div className="pf-facet-list">
              {["本科 Bachelor", "硕士 Master", "博士 PhD", "预科 Foundation"].map((label) => (
                <span key={label} className="pf-check" style={{ color: "#8a9490" }}>
                  <input type="checkbox" disabled />
                  <span className="pf-check-label">{label}</span>
                  <span className="pf-count" style={{ color: "#a8a197" }}>
                    —
                  </span>
                </span>
              ))}
            </div>
          </fieldset>

          <p className="pf-notice" id="pf-inert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a5a12" strokeWidth="1.9" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8h.01M12 11v5" strokeLinecap="round" />
            </svg>
            <span>
              灰色筛选项的计数将在专业数据发布后出现。无排名筛选项：排名数据未获授权展示。
            </span>
          </p>
        </aside>

        <section className="pf-results">
          <div className="pf-controls">
            <div className="pf-scope">
              <span className="pf-on">院校 {total}</span>
              <span className="pf-off">专业 0</span>
            </div>
            <span className="pf-tally">
              {filtered ? "已筛选 · " : ""}
              共 <strong>{result.matched}</strong> 所
            </span>
            <form action="/" method="get" style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {q ? <input type="hidden" name="q" value={q} /> : null}
              {destinations.map((value) => (
                <input key={value} type="hidden" name="dest" value={value} />
              ))}
              {stateFilter.map((value) => (
                <input key={value} type="hidden" name="state" value={value} />
              ))}
              <label htmlFor="pf-sort" style={{ fontSize: "13px", color: "#6b736f" }}>
                排序
              </label>
              <select id="pf-sort" name="sort" defaultValue={sort} className="pf-select">
                {SORTS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button type="submit" className="pf-page">
                应用
              </button>
            </form>
          </div>

          {filtered ? (
            <div className="pf-chips">
              {q ? (
                <Link className="pf-chip" href={atPage({ ...params, q: undefined }, 1)}>
                  「{q}」<Cross />
                </Link>
              ) : null}
              {destinations.map((value) => (
                <Link key={value} className="pf-chip" href={toggled(params, "dest", value)}>
                  {value}
                  <Cross />
                </Link>
              ))}
              {stateFilter.map((value) => (
                <Link
                  key={value}
                  className={`pf-chip ${value === "verified" ? "pf-chip-verified" : ""}`}
                  href={toggled(params, "state", value)}
                >
                  {value === "verified" ? "已核验来源" : "待核验"}
                  <Cross />
                </Link>
              ))}
            </div>
          ) : null}

          {result.institutions.length === 0 ? (
            <div className="pf-empty">
              <span style={{ flexGrow: 1, fontSize: "14px", color: "#4a534f" }}>
                没有符合条件的院校。请调整筛选条件，或
                <Link href="/">查看全部 {total} 所</Link>。
              </span>
            </div>
          ) : (
            result.institutions.map((institution) => {
              const sources = verifiedSourceCount(institution.slug);
              const verified = sources > 0;
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
                        <Link href={`/institutions/${institution.slug}`} lang="en">
                          {institution.name}
                        </Link>
                        {verified ? (
                          <span className="pf-tag pf-tag-verified">
                            <Tick />
                            已核验 {sources} 项来源
                          </span>
                        ) : (
                          <span className="pf-tag pf-tag-pending">待核验</span>
                        )}
                      </div>
                      <span className="pf-where">
                        {institution.destination} · <span lang="en">{institution.country}</span>
                      </span>

                      <div className="pf-prov">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b736f" strokeWidth="1.9" aria-hidden="true">
                          <rect x="3" y="4" width="18" height="16" rx="1.5" />
                          <path d="M3 9h18M8 13h8" strokeLinecap="round" />
                        </svg>
                        <span className="pf-prov-text">
                          {verified
                            ? "来源 anu.edu.au · study.anu.edu.au · programsandcourses.anu.edu.au — 快照 [ 日期 ] · 核验人 [ 姓名 ]"
                            : "已入库，尚未开始来源核验 — 因此不展示任何具体数值"}
                        </span>
                      </div>
                    </div>
                    <div className="pf-result-actions">
                      <Link className="pf-btn pf-btn-solid" href={`/institutions/${institution.slug}`}>
                        查看档案
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })
          )}

          {result.pages > 1 ? (
            <nav className="pf-pager" aria-label="分页">
              <span className="pf-pager-tally">
                共 {result.matched} 所 · 每页 {result.perPage} 条 · 第 {result.page} /{" "}
                {result.pages} 页
              </span>
              {result.page > 1 ? (
                <Link className="pf-page" href={atPage(params, result.page - 1)}>
                  上一页
                </Link>
              ) : (
                <span className="pf-page pf-page-off">上一页</span>
              )}
              {pageWindow(result.page, result.pages).map((number) => (
                <Link
                  key={number}
                  className={`pf-page ${number === result.page ? "pf-page-on" : ""}`}
                  href={atPage(params, number)}
                  aria-current={number === result.page ? "page" : undefined}
                >
                  {number}
                </Link>
              ))}
              {result.page < result.pages ? (
                <Link className="pf-page" href={atPage(params, result.page + 1)}>
                  下一页
                </Link>
              ) : (
                <span className="pf-page pf-page-off">下一页</span>
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

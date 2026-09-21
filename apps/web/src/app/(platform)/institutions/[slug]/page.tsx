import Link from "next/link";
import { notFound } from "next/navigation";

import { Crest } from "@/components/platform/crest";
import { allSlugs, bySlug, verifiedSourceCount } from "@/lib/catalogue/catalogue";

/**
 * 院校档案 — one institution, and everything the platform can say about it.
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

export function generateStaticParams() {
  return allSlugs().map((slug) => ({ slug }));
}

export default async function InstitutionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const institution = bySlug(slug);
  if (!institution) notFound();

  const sources = verifiedSourceCount(slug);
  const verified = sources > 0;

  return (
    <>
      <section className="pf-masthead">
        <div className="pf-masthead-body">
          <Link href="/" style={{ fontSize: "12.5px", color: "#6b736f", textDecoration: "none" }}>
            ← 返回院校检索
          </Link>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "16px", marginTop: "12px" }}>
            <Crest name={institution.name} verified={verified} />
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
              <h1 lang="en" style={{ fontSize: "32px", lineHeight: 1.12 }}>
                {institution.name}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "14px", color: "#4a534f" }}>
                  {institution.destination} · <span lang="en">{institution.country}</span>
                </span>
                {verified ? (
                  <span className="pf-tag pf-tag-verified">已核验 {sources} 项来源</span>
                ) : (
                  <span className="pf-tag pf-tag-pending">待核验</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="pf-doc">
        <div className="pf-doc-main">
          {!verified ? (
            <p className="pf-callout pf-callout-warn">
              <strong>该院校尚未开始来源核验。</strong>
              院校已按 QS 2027 名单入库，但平台还没有取得其官网快照，也没有经审核人确认的数据。
              因此本页不展示任何学费、语言要求或申请截止日期 —— 不从第三方聚合、不按往年推算。
            </p>
          ) : null}

          <section>
            <div className="pf-section-head">
              <h2>关键信息</h2>
              <span className="pf-section-note">每一格下方标注其来源页面、快照日期与核验人</span>
            </div>
            <div className="pf-facts">
              <Fact
                label="英语语言要求"
                value="IELTS [ 待发布 ]"
                verified={verified}
                provenance={
                  verified
                    ? "study.anu.edu.au/apply/english-language-requirements · 快照 [ 日期 ] · 核验人 [ 姓名 ]"
                    : "无已核验来源"
                }
              />
              <Fact
                label="国际生学费 / 年"
                value="[ 待发布 ]"
                verified={verified}
                provenance={
                  verified
                    ? "www.anu.edu.au · 币种以官网公布为准 · 快照 [ 日期 ] · 核验人 [ 姓名 ]"
                    : "无已核验来源"
                }
              />
              <Fact
                label="申请截止"
                value="[ 待发布 ]"
                verified={verified}
                provenance={
                  verified
                    ? "study.anu.edu.au · 仅采用官网公布日期，不按往年推算 · 快照 [ 日期 ]"
                    : "无已核验来源"
                }
              />
              {verified ? (
                <div className="pf-fact pf-fact-pending">
                  <div className="pf-fact-label">
                    <span>研究生入学</span>
                    <span className="pf-tag pf-tag-pending">无可用来源</span>
                  </div>
                  <span className="pf-fact-value pf-fact-value-pending">暂不展示</span>
                  <span className="pf-fact-prov">
                    所提交页面返回 HTTP 404，无快照可读。此处留空，不以其他页面推测填补。
                  </span>
                </div>
              ) : null}
            </div>
          </section>

          <section>
            <div className="pf-section-head">
              <h2>入学要求</h2>
              <span className="pf-section-note">「适用对象」为本平台强制字段</span>
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
                  <Th>项目</Th>
                  <Th>数值</Th>
                  <Th>适用对象</Th>
                  <Th>来源</Th>
                </tr>
              </thead>
              <tbody>
                {["IELTS 总分", "TOEFL iBT", "学历要求"].map((item) => (
                  <tr key={item}>
                    <Td strong>{item}</Td>
                    <Td>[ 待发布 ]</Td>
                    <Td muted>[ 待人工判定 ]</Td>
                    <Td>{verified ? "study.anu.edu.au" : "—"}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="pf-callout">
              页面若写明某项要求只适用于特定申请人，即按原文标注。
              <strong>未写明适用对象的要求，不会被当作「适用所有人」</strong>
              —— 这是与聚合类平台最根本的差别。
            </p>
          </section>
        </div>

        <aside className="pf-doc-rail">
          <div className="pf-rail-card">
            <span className="pf-eyebrow">已核验官方域名</span>
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
                <span className="pf-rail-small">
                  页面只有在其域名先通过院校归属核验后，才可被引用。
                </span>
              </>
            ) : (
              <span className="pf-rail-small">
                尚无已核验域名。核验须先确认某主机确实归该院校所有或获其正式授权。
              </span>
            )}
          </div>

          {verified ? (
            <div className="pf-list-card">
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span className="pf-eyebrow" style={{ flexGrow: 1 }}>
                  来源清单
                </span>
                <span style={{ fontSize: "12.5px", color: "#4a534f" }}>6 / 9</span>
              </div>
              {[
                "院校首页",
                "本科入学",
                "专业目录",
                "语言要求",
                "学费与费用",
                "申请截止",
              ].map((label) => (
                <span key={label} style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                  <span className="pf-dot pf-dot-on" />
                  <span style={{ flexGrow: 1, fontSize: "13px" }}>{label}</span>
                </span>
              ))}
              {["研究生入学", "博士入学", "学术日历"].map((label) => (
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

function Fact({
  label,
  value,
  verified,
  provenance,
}: {
  label: string;
  value: string;
  verified: boolean;
  provenance: string;
}) {
  return (
    <div className={`pf-fact ${verified ? "" : "pf-fact-pending"}`}>
      <div className="pf-fact-label">
        <span>{label}</span>
        {verified ? (
          <span className="pf-tag pf-tag-verified">来源已核验</span>
        ) : (
          <span className="pf-tag pf-tag-pending">待核验</span>
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

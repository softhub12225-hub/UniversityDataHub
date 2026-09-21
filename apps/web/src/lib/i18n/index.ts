/**
 * Chinese and English for the public platform.
 *
 * WHY THE LOCALE IS IN THE URL AND NOT A COOKIE
 * =============================================
 * `?lang=en` rather than a stored preference, because these pages get sent to other
 * people. A consultant filters the catalogue and pastes the link to a student or a
 * colleague; with a cookie that link arrives in whatever language the recipient
 * happened to have set, and the sender cannot tell. In the URL, a link means one
 * thing for everyone who opens it.
 *
 * It also keeps the toggle a plain `<a href>`: switching language needs no JavaScript,
 * and the back button does what it looks like it does.
 *
 * WHAT IS NEVER TRANSLATED
 * ========================
 * Institution names. QS publishes them in English and that is the form the catalogue
 * stores, so they render `lang="en"` inside Chinese copy rather than being
 * transliterated into something no official page uses. Destinations *are* localised,
 * because the workbook supplies both ("中国香港" / "Hong Kong SAR").
 */

export type Locale = "zh" | "en";

export const DEFAULT_LOCALE: Locale = "zh";

/** The BCP 47 tag for `<html lang>` / `lang` attributes. */
export const HTML_LANG: Record<Locale, string> = {
  zh: "zh-CN",
  en: "en",
};

export function parseLocale(raw: string | string[] | undefined): Locale {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === "en" ? "en" : DEFAULT_LOCALE;
}

/**
 * Add the locale to a href, and only when it is not the default.
 *
 * The Chinese URL stays clean (`/institutions/ucl`), which matters because it is the
 * one most people will see and share. English carries `?lang=en`.
 */
export function localised(href: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return href;
  return href.includes("?") ? `${href}&lang=en` : `${href}?lang=en`;
}

export interface Messages {
  readonly brand: string;
  readonly searchPlaceholder: string;
  readonly searchLabel: string;
  readonly navInstitutions: string;
  readonly navStatus: string;
  readonly navConsole: string;
  readonly navSignIn: string;
  readonly toggleTo: string;
  readonly toggleLabel: string;

  readonly title: string;

  readonly filters: string;
  readonly clear: string;
  readonly verification: string;
  readonly verified: string;
  readonly pending: string;
  readonly verificationNote: string;
  readonly destination: string;

  readonly scopeInstitutions: string;
  readonly scopeProgrammes: string;
  readonly filteredPrefix: string;
  readonly matched: (n: number) => [string, string];
  readonly sort: string;
  readonly sortVerified: string;
  readonly sortName: string;
  readonly sortDestination: string;
  readonly apply: string;

  readonly verifiedSources: (n: number) => string;
  readonly moreDetail: string;
  readonly sourcesLabel: string;
  readonly provPending: string;
  readonly noResults: (n: number) => string;
  readonly showAll: string;

  readonly pagerTally: (matched: number, perPage: number, page: number, pages: number) => string;
  readonly prev: string;
  readonly next: string;

  readonly backToSearch: string;
  readonly notVerifiedBanner: string;
  readonly keyFacts: string;
  readonly keyFactsNote: string;
  readonly english: string;
  readonly tuition: string;
  readonly deadline: string;
  readonly postgraduate: string;
  readonly noSource: string;
  readonly notShown: string;
  readonly notShownWhy: string;
  readonly awaitingValue: string;
  readonly sourceVerified: string;
  readonly noVerifiedSource: string;
  readonly requirements: string;
  readonly requirementsNote: string;
  readonly colItem: string;
  readonly colValue: string;
  readonly colAppliesTo: string;
  readonly colSource: string;
  readonly reqIelts: string;
  readonly reqToefl: string;
  readonly reqAcademic: string;
  readonly pendingScope: string;
  readonly scopeCallout: readonly [string, string, string];
  readonly verifiedDomains: string;
  readonly domainsNote: string;
  readonly noDomains: string;
  readonly sourceList: string;
  readonly srcHome: string;
  readonly srcUndergrad: string;
  readonly srcCatalog: string;
  readonly srcLanguage: string;
  readonly srcTuition: string;
  readonly srcDeadline: string;
  readonly srcPostgrad: string;
  readonly srcPhd: string;
  readonly srcCalendar: string;

  readonly footNote: string;
}

const zh: Messages = {
  brand: "Verified Admissions",
  searchPlaceholder: "检索院校名称、地区…",
  searchLabel: "检索院校",
  navInstitutions: "院校",
  navStatus: "系统状态",
  navConsole: "审核后台",
  navSignIn: "登录",
  toggleTo: "EN",
  toggleLabel: "切换到英文",

  title: "院校检索",

  filters: "筛选条件",
  clear: "清除",
  verification: "数据核验",
  verified: "已核验来源",
  pending: "待核验",
  verificationNote:
    "「已核验」指该院校的官网来源已由审核人确认。平台不以第三方聚合数据填补空缺。",
  destination: "目的地",

  scopeInstitutions: "院校",
  scopeProgrammes: "专业",
  filteredPrefix: "已筛选 · ",
  // Chinese needs no plural form, so the count is not consulted here.
  matched: () => ["共 ", " 所"],
  sort: "排序",
  sortVerified: "已核验优先",
  sortName: "院校名称 A–Z",
  sortDestination: "按目的地",
  apply: "应用",

  verifiedSources: (n) => `已核验 ${n} 项来源`,
  moreDetail: "查看详情",
  sourcesLabel: "官方来源",
  provPending: "已入库，尚未开始来源核验",
  noResults: () => "没有符合条件的院校。请调整筛选条件，或",
  showAll: "查看全部",

  pagerTally: (matched, perPage, page, pages) =>
    `共 ${matched} 所 · 每页 ${perPage} 条 · 第 ${page} / ${pages} 页`,
  prev: "上一页",
  next: "下一页",

  backToSearch: "← 返回院校检索",
  notVerifiedBanner:
    "院校已按 QS 2027 名单入库，但平台还没有取得其官网快照，也没有经审核人确认的数据。因此本页不展示任何学费、语言要求或申请截止日期 —— 不从第三方聚合、不按往年推算。",
  keyFacts: "关键信息",
  keyFactsNote: "每一格下方标注其来源页面、快照日期与核验人",
  english: "英语语言要求",
  tuition: "国际生学费 / 年",
  deadline: "申请截止",
  postgraduate: "研究生入学",
  noSource: "无可用来源",
  notShown: "暂不展示",
  notShownWhy: "所提交页面返回 HTTP 404，无快照可读。此处留空，不以其他页面推测填补。",
  awaitingValue: "[ 待发布 ]",
  sourceVerified: "来源已核验",
  noVerifiedSource: "无已核验来源",
  requirements: "入学要求",
  requirementsNote: "「适用对象」为本平台强制字段",
  colItem: "项目",
  colValue: "数值",
  colAppliesTo: "适用对象",
  colSource: "来源",
  reqIelts: "IELTS 总分",
  reqToefl: "TOEFL iBT",
  reqAcademic: "学历要求",
  pendingScope: "[ 待人工判定 ]",
  scopeCallout: [
    "页面若写明某项要求只适用于特定申请人，即按原文标注。",
    "未写明适用对象的要求，不会被当作「适用所有人」",
    " —— 这是与聚合类平台最根本的差别。",
  ],
  verifiedDomains: "已核验官方域名",
  domainsNote: "页面只有在其域名先通过院校归属核验后，才可被引用。",
  noDomains: "尚无已核验域名。核验须先确认某主机确实归该院校所有或获其正式授权。",
  sourceList: "来源清单",
  srcHome: "院校首页",
  srcUndergrad: "本科入学",
  srcCatalog: "专业目录",
  srcLanguage: "语言要求",
  srcTuition: "学费与费用",
  srcDeadline: "申请截止",
  srcPostgrad: "研究生入学",
  srcPhd: "博士入学",
  srcCalendar: "学术日历",

  footNote:
    "院校收录范围依据 QS World University Rankings 2027（版权归 QS Quacquarelli Symonds 所有）· 本平台不展示排名数值",
};

const en: Messages = {
  brand: "Verified Admissions",
  searchPlaceholder: "Search institutions, destinations…",
  searchLabel: "Search institutions",
  navInstitutions: "Institutions",
  navStatus: "System status",
  navConsole: "Reviewer console",
  navSignIn: "Sign in",
  toggleTo: "中文",
  toggleLabel: "Switch to Chinese",

  title: "Institution search",

  filters: "Filters",
  clear: "Clear",
  verification: "Verification",
  verified: "Verified sources",
  pending: "Awaiting verification",
  verificationNote:
    "“Verified” means a reviewer has confirmed this institution's own pages as the source. Nothing is filled in from third-party aggregators.",
  destination: "Destination",

  scopeInstitutions: "Institutions",
  scopeProgrammes: "Programmes",
  filteredPrefix: "Filtered · ",
  matched: (n) => ["", n === 1 ? " institution" : " institutions"],
  sort: "Sort",
  sortVerified: "Verified first",
  sortName: "Name A–Z",
  sortDestination: "By destination",
  apply: "Apply",

  verifiedSources: (n) => `${n} sources verified`,
  moreDetail: "More Detail",
  sourcesLabel: "Official sources",
  provPending: "In the catalogue; source verification has not started",
  noResults: () => "No institutions match these filters. Adjust them, or",
  showAll: "see all",

  pagerTally: (matched, perPage, page, pages) =>
    `${matched} institutions · ${perPage} per page · page ${page} of ${pages}`,
  prev: "Previous",
  next: "Next",

  backToSearch: "← Back to search",
  notVerifiedBanner:
    "This institution is in the catalogue from the QS 2027 list, but no snapshot of its own pages has been captured and no figure has been approved by a reviewer. So no tuition, language requirement or deadline is shown — nothing is aggregated from elsewhere and nothing is estimated from previous cycles.",
  keyFacts: "Key facts",
  keyFactsNote: "Each cell names the page it came from, when it was captured, and who approved it",
  english: "English requirement",
  tuition: "Tuition, international / year",
  deadline: "Application deadline",
  postgraduate: "Postgraduate admissions",
  noSource: "No source available",
  notShown: "Not shown",
  notShownWhy:
    "The submitted page returned HTTP 404, so there is no snapshot to read. Left blank rather than inferred from another page.",
  awaitingValue: "[ AWAITING PUBLICATION ]",
  sourceVerified: "Source verified",
  noVerifiedSource: "No verified source",
  requirements: "Entry requirements",
  requirementsNote: "“Applies to” is a mandatory field on this platform",
  colItem: "Requirement",
  colValue: "Value",
  colAppliesTo: "Applies to",
  colSource: "Source",
  reqIelts: "IELTS overall",
  reqToefl: "TOEFL iBT",
  reqAcademic: "Academic entry",
  pendingScope: "[ AWAITING REVIEW ]",
  scopeCallout: [
    "Where a page states that a requirement applies only to some applicants, it is shown that way. ",
    "A requirement with no stated audience is never promoted to “everyone”",
    " — which is the most basic difference from an aggregator.",
  ],
  verifiedDomains: "Verified official domains",
  domainsNote: "A page is citable only once its host has been verified as belonging to the institution.",
  noDomains:
    "No verified domain yet. Verification first establishes that a host really is the institution's, or is officially authorised by it.",
  sourceList: "Sources",
  srcHome: "University home",
  srcUndergrad: "Undergraduate admissions",
  srcCatalog: "Programme catalogue",
  srcLanguage: "Language requirements",
  srcTuition: "Tuition and fees",
  srcDeadline: "Application deadlines",
  srcPostgrad: "Postgraduate admissions",
  srcPhd: "PhD admissions",
  srcCalendar: "Academic calendar",

  footNote:
    "Catalogue coverage follows QS World University Rankings 2027 (© QS Quacquarelli Symonds) · rank values are not displayed",
};

const DICTIONARIES: Record<Locale, Messages> = { zh, en };

export function t(locale: Locale): Messages {
  return DICTIONARIES[locale];
}

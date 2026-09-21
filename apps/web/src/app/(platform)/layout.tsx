import Link from "next/link";

import "../platform.css";

/**
 * The public platform's frame.
 *
 * Search sits in this rail on every page, which is the structural decision that keeps
 * the design off the portal template: those sites put a search box inside a
 * photographic hero on the home page and a different one in the header everywhere
 * else. Here there is one search, it is part of the application frame, and the
 * catalogue is the first thing you see rather than a marketing page you scroll past.
 *
 * The rail's form is a plain GET to `/`. No JavaScript is required to search, which
 * also means the URL is the state: a filtered result set can be linked, bookmarked
 * and reloaded, and the server renders exactly what the URL asks for.
 */
export default function PlatformLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="pf">
      <header className="pf-rail">
        <Link className="pf-brand" href="/">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#f4c9a0" strokeWidth="1.7" aria-hidden="true">
            <path d="M3 9.5 12 4l9 5.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6.5 11.5v6.5M11 11.5v6.5M15.5 11.5v6.5" strokeLinecap="round" />
            <path d="M4 20h16" strokeLinecap="round" />
          </svg>
          <span>Verified Admissions</span>
        </Link>

        <form className="pf-railsearch" action="/" method="get" role="search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8e948f" strokeWidth="2.2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4.3-4.3" strokeLinecap="round" />
          </svg>
          <label className="pf-sr" htmlFor="pf-q">
            检索院校
          </label>
          <input id="pf-q" name="q" type="search" placeholder="检索院校名称、地区…" />
        </form>

        <nav className="pf-railnav">
          <Link href="/">院校</Link>
          <Link className="pf-quiet" href="/system-status">
            系统状态
          </Link>
          <Link className="pf-quiet" href="/review">
            审核后台
          </Link>
          <Link className="pf-cta" href="/review/login">
            登录
          </Link>
        </nav>
      </header>

      {children}

      <footer className="pf-foot">
        <span className="pf-foot-brand">Verified Admissions</span>
        <span className="pf-foot-note">
          院校收录范围依据 QS World University Rankings 2027（版权归 QS Quacquarelli
          Symonds 所有）· 本平台不展示排名数值
        </span>
      </footer>
    </div>
  );
}

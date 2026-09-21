import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Verified Admissions",
  description: "院校与专业检索 — 每一项数据都附带来源、快照与核验人",
  // Internal tooling behind authentication; it should never be indexed.
  robots: { index: false, follow: false },
};

/**
 * The root layout carries no chrome.
 *
 * It used to render a shared header and nav for the whole application, which meant
 * the reviewer console drew its own console chrome *inside* that header — two
 * headers stacked on every console page. Each surface now owns its frame: the public
 * platform in `(platform)/layout.tsx`, the console in `review/layout.tsx`. This file
 * exists for `<html>`, `<body>` and the global reset only.
 *
 * `lang` is zh-CN because the interface is Chinese-first: the users are Chinese
 * education consultants. Institution names stay in the official English QS publishes
 * them under, and are marked `lang="en"` where they appear.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

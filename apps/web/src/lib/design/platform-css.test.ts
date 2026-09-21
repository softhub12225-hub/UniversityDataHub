import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Guards one CSS invariant that cost a visible bug.
 *
 * `platform.css` sets a default colour for inline links:
 *
 *     .pf a { color: var(--pf-accent); }
 *
 * One class plus one element is specificity (0,1,1), which outranks any rule written
 * with a single class -- regardless of the order in the file. So a component that
 * renders as an anchor and states its colour as `.pf-btn-solid { color: #fff }` does
 * not get white text. It gets oxblood, silently.
 *
 * That went unnoticed for as long as the primary button was near-black, because
 * oxblood on near-black is only poor contrast. When the button became oxblood, the
 * text and the background were the same colour and the label vanished entirely.
 *
 * A human cannot see this by reading either file alone: it needs the stylesheet and
 * the JSX at once -- which class lands on an `<a>`, and what specificity its colour
 * rule has. That is why this is a test and not a comment.
 */

const WEB_SRC = join(__dirname, "..", "..");
const CSS_PATH = join(WEB_SRC, "app", "platform.css");

/** The element-plus-class default every anchor component has to outrank. */
const DEFAULT_LINK_RULE = ".pf a";

type Specificity = readonly [number, number, number];

function countMatches(value: string, pattern: RegExp): number {
  return Array.from(value.matchAll(pattern)).length;
}

/** Specificity as (ids, classes, elements) — enough for the selectors in this file. */
function specificity(selector: string): Specificity {
  const ids = countMatches(selector, /#[\w-]+/g);
  // Classes, attribute selectors and pseudo-classes share the middle column.
  const classes =
    countMatches(selector, /\.[\w-]+/g) +
    countMatches(selector, /\[[^\]]+\]/g) +
    countMatches(selector, /:(?!:)[\w-]+/g);
  // Element names: a bare word at the start or after a combinator.
  const elements = countMatches(selector, /(?:^|[\s>+~])[a-z][\w-]*/g);
  return [ids, classes, elements];
}

function beats(left: Specificity, right: Specificity): boolean {
  const [leftIds, leftClasses, leftElements] = left;
  const [rightIds, rightClasses, rightElements] = right;
  if (leftIds !== rightIds) return leftIds > rightIds;
  if (leftClasses !== rightClasses) return leftClasses > rightClasses;
  return leftElements > rightElements;
}

function tsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return tsxFiles(path);
    return path.endsWith(".tsx") ? [path] : [];
  });
}

/**
 * Element names that render an anchor, and therefore inherit `.pf a`.
 *
 * `BurstLink` is listed because it forwards its className straight to a `<Link>`. If a
 * future wrapper is forgotten here, the "finds the anchor components" assertion below
 * is what catches it — a scan quietly returning less is the failure mode this guard
 * most has to survive.
 */
const ANCHOR_ELEMENTS = ["Link", "a", "BurstLink"] as const;

/** Every `pf-*` class the JSX puts directly on one of those. */
function anchorClasses(): ReadonlySet<string> {
  const found = new Set<string>();
  const opening = new RegExp(`<(?:${ANCHOR_ELEMENTS.join("|")})\\b([^>]*?)>`, "gs");
  for (const file of tsxFiles(WEB_SRC)) {
    const source = readFileSync(file, "utf8");
    for (const tag of source.matchAll(opening)) {
      const attributes = tag[1] ?? "";
      for (const attr of attributes.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g)) {
        const names = attr[1] ?? attr[2] ?? "";
        for (const name of names.matchAll(/pf-[a-z-]+/g)) {
          const value = name[0];
          if (value.length > 0) found.add(value);
        }
      }
    }
  }
  return found;
}

interface Rule {
  readonly selector: string;
  readonly declarations: string;
}

function parseRules(css: string): Rule[] {
  const out: Rule[] = [];
  // Comments go first: they contain braces and example selectors.
  const bare = css.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const match of bare.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = (match[1] ?? "").trim();
    if (selector.length === 0 || selector.startsWith("@")) continue;
    out.push({ selector, declarations: match[2] ?? "" });
  }
  return out;
}

/** `color:` itself — not `background-color:`, `border-color:` or `-decoration-color:`. */
function setsColour(declarations: string): boolean {
  return /(?:^|[;{\s])color\s*:/.test(declarations);
}

describe("platform.css anchor colours", () => {
  const css = readFileSync(CSS_PATH, "utf8");
  const rules = parseRules(css);
  const onAnchors = anchorClasses();

  it("still defines the inline-link default this invariant is about", () => {
    const found = rules.find((rule) => rule.selector === DEFAULT_LINK_RULE);
    expect(found, `${DEFAULT_LINK_RULE} is gone; revisit this test`).toBeDefined();
    expect(setsColour(found?.declarations ?? "")).toBe(true);
  });

  it("finds the anchor components it is meant to check", () => {
    // Without this, a JSX scan that silently matches nothing would make every
    // assertion below pass vacuously and the guard would be worthless.
    expect(onAnchors.size).toBeGreaterThan(3);
    expect(onAnchors.has("pf-btn-solid")).toBe(true);
  });

  it("colours every anchor component above the inline-link default", () => {
    const base = specificity(DEFAULT_LINK_RULE);
    const offenders: string[] = [];

    for (const rule of rules) {
      if (!setsColour(rule.declarations)) continue;
      for (const selector of rule.selector.split(",").map((part) => part.trim())) {
        // Only a rule whose target is an anchor component can be shadowed.
        const compounds = selector.split(/[\s>+~]+/);
        const last = compounds[compounds.length - 1] ?? "";
        const target = last.match(/^\.([\w-]+)/)?.[1];
        if (target === undefined || !onAnchors.has(target)) continue;
        const own = specificity(selector);
        if (!beats(own, base)) {
          offenders.push(
            `${selector} (${own.join(",")}) does not beat ` +
              `${DEFAULT_LINK_RULE} (${base.join(",")}) — write it as ".pf ${selector}"`,
          );
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});

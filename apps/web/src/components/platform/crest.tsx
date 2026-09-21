/**
 * A neutral mark beside an institution's name.
 *
 * NOT A LOGO, DELIBERATELY
 * ========================
 * The reference portals show each university's own logo. This platform holds no
 * licensed logo assets, and drawing something logo-shaped from an institution's
 * initial would imply an affiliation and a provenance it does not have — on a product
 * whose entire claim is that nothing is displayed without a source.
 *
 * So: the institution's first letter set in the display serif on a plain field, the
 * same geometry for every institution, tinted by verification state rather than by
 * brand. It is a typographic marker, and it cannot be mistaken for an emblem.
 *
 * THE FIELD IS CSS, NOT A <rect>
 * ==============================
 * A verified crest carries the dawn gradient, and an SVG gradient has to be
 * referenced through a `<linearGradient id>`. Twenty results on a page would put
 * twenty elements with the same id into the document — invalid, and the kind of thing
 * that works right up until something else starts resolving ids. So the field is a
 * background on `.pf-crest` in the stylesheet and this renders only the letter.
 */
export function Crest({ name, verified }: { name: string; verified: boolean }) {
  // The first Latin letter; QS publishes every name in English, so this is stable.
  const initial = (name.match(/[A-Za-z]/)?.[0] ?? name.charAt(0)).toUpperCase();

  return (
    <svg
      className={`pf-crest ${verified ? "pf-crest-verified" : ""}`}
      viewBox="0 0 46 46"
      role="img"
      aria-label={`${name} 标记`}
    >
      <text
        x="23"
        y="23"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--pf-serif)"
        fontSize="21"
        fontWeight="600"
        // Light on the gradient field, mid-ink on the pale one. Both clear 4.5:1
        // against the background the stylesheet puts behind them -- 9.35:1 and
        // 4.98:1 measured. At 21px bold this is "large text" and 3:1 would do, but
        // an initial in a box is the sort of thing people squint at.
        fill={verified ? "#ffe9cf" : "#585f6c"}
      >
        {initial}
      </text>
    </svg>
  );
}

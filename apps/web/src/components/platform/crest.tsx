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
 */
export function Crest({ name, verified }: { name: string; verified: boolean }) {
  // The first Latin letter; QS publishes every name in English, so this is stable.
  const initial = (name.match(/[A-Za-z]/)?.[0] ?? name.charAt(0)).toUpperCase();

  return (
    <svg className="pf-crest" viewBox="0 0 46 46" role="img" aria-label={`${name} 标记`}>
      <rect width="46" height="46" fill={verified ? "#141a18" : "#e5dfd0"} />
      <text
        x="23"
        y="23"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Fraunces, Georgia, serif"
        fontSize="21"
        fontWeight="600"
        fill={verified ? "#f4c9a0" : "#9a9186"}
      >
        {initial}
      </text>
    </svg>
  );
}

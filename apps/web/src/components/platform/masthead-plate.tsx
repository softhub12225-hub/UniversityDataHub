/**
 * The masthead's photographic plate.
 *
 * This is a placeholder, and it is labelled as one on screen. A licensed campus
 * photograph belongs here; until there is one, an unlabelled illustration would
 * quietly become the shipped asset, which is how placeholder art ends up in
 * production. Swapping it is one element: replace the `<svg>` with an `<img>`.
 *
 * Drawn rather than gradient-washed: layered architectural silhouettes in the
 * accent duotone, with a film-grain filter. It reads as an edge treatment beside the
 * type, never as a hero behind a search box.
 */
export function MastheadPlate() {
  return (
    <svg viewBox="0 0 292 92" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="pf-duo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8c2f1f" />
          <stop offset="100%" stopColor="#2a1512" />
        </linearGradient>
        <filter id="pf-grain">
          <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>

      <rect width="292" height="92" fill="url(#pf-duo)" />
      <circle cx="244" cy="20" r="15" fill="#f4c9a0" opacity="0.3" />

      {/* colonnade */}
      <rect x="36" y="42" width="150" height="50" fill="#2a1512" opacity="0.66" />
      <path d="M28 42 L111 16 L194 42 Z" fill="#2a1512" opacity="0.74" />
      <rect x="52" y="58" width="11" height="34" rx="5.5" fill="#57201a" opacity="0.9" />
      <rect x="78" y="58" width="11" height="34" rx="5.5" fill="#57201a" opacity="0.9" />
      <rect x="104" y="58" width="11" height="34" rx="5.5" fill="#57201a" opacity="0.9" />
      <rect x="130" y="58" width="11" height="34" rx="5.5" fill="#57201a" opacity="0.9" />
      <rect x="156" y="58" width="11" height="34" rx="5.5" fill="#57201a" opacity="0.9" />

      {/* tower */}
      <rect x="212" y="34" width="30" height="58" fill="#2a1512" opacity="0.7" />
      <path d="M206 34 L227 16 L248 34 Z" fill="#2a1512" opacity="0.8" />

      <rect width="292" height="92" filter="url(#pf-grain)" opacity="0.1" />
    </svg>
  );
}

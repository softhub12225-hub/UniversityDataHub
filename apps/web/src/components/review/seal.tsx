/**
 * The console's mark: a shield with a check inside it.
 *
 * A seal, because that is what this console does. Everything here ends in someone
 * attesting that a figure may be published, and the mark should say that rather than
 * being a generic glyph.
 *
 * It lives in its own file because both the rail and the sign-in page draw it at
 * different sizes. Two copies of the same path is the kind of duplication that stays
 * identical right up until one of them is adjusted.
 */
export function Seal({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2.6 20 6v6.2c0 4.6-3.2 8-8 9.2-4.8-1.2-8-4.6-8-9.2V6l8-3.4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="m8.6 12.2 2.4 2.4 4.4-4.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

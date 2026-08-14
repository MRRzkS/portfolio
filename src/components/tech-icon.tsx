import { BRAND_MARKS, FALLBACK_MARK } from '@/lib/brand-marks';

interface TechIconProps {
  name: string;
  /** Optional uploaded brand logo. When present it replaces the generated mark. */
  iconUrl?: string | null;
}

/**
 * The mark sits on a tint of its own brand colour, passed down as the custom
 * property `--c` so one CSS rule covers every technology. A technology with an
 * uploaded logo renders that image instead, tinted the same way.
 */
export function TechIcon({ name, iconUrl }: TechIconProps) {
  const mark = BRAND_MARKS[name];
  const color = mark?.color ?? FALLBACK_MARK.color;

  return (
    <span className="ico" style={{ '--c': color } as React.CSSProperties}>
      {iconUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- small admin-sourced logos, no optimisation needed
        <img src={iconUrl} alt="" width={16} height={16} />
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {mark ? (
            <path d={mark.path} />
          ) : (
            FALLBACK_MARK.rects.map((rect, index) => <rect key={index} {...rect} />)
          )}
        </svg>
      )}
    </span>
  );
}

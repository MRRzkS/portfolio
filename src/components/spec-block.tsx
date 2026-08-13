import type { Metric } from '@/lib/types';

interface SpecBlockProps {
  metrics: Metric[];
}

/**
 * Key Results rendered as a product datasheet. The screening brief requires
 * every experience point to carry a number, so this block is doing real work
 * rather than decorating the page.
 */
export function SpecBlock({ metrics }: SpecBlockProps) {
  if (metrics.length === 0) return null;

  return (
    <div className="spec">
      <div className="spec-head">
        <span className="t">Key results</span>
        <span className="n">MEASURED</span>
      </div>

      {metrics.map((metric) => (
        <div className="spec-row" key={metric.label}>
          <span className="k">{metric.label}</span>
          <span className="v">{metric.value}</span>
        </div>
      ))}
    </div>
  );
}

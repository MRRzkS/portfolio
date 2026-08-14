import { TechIcon } from '@/components/tech-icon';
import { CATEGORY_LABEL, CATEGORY_ORDER } from '@/lib/types';
import type { TechStackItem } from '@/lib/types';

interface TechStackProps {
  items: TechStackItem[];
}

export function TechStack({ items }: TechStackProps) {
  // A category with nothing in it renders no column, so removing the last
  // entry from the dashboard cannot leave an empty card behind.
  const columns = CATEGORY_ORDER.map((category) => ({
    category,
    items: items.filter((item) => item.category === category),
  })).filter((column) => column.items.length > 0);

  return (
    <section id="stack" className="sec-mist">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">02 / Stack</span>
          <h2>What I actually reach for.</h2>
          <p>
            Everything listed here appears in a project on this page. Nothing is here because it
            looks good in a list.
          </p>
        </div>

        <div className="stack-grid">
          {columns.map((column) => (
            <div className="stack-col" key={column.category}>
              <h4>{CATEGORY_LABEL[column.category]}</h4>
              <ul>
                {column.items.map((item) => (
                  <li key={item.id}>
                    <TechIcon name={item.name} iconUrl={item.icon_url} />
                    <span>{item.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

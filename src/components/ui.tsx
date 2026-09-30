import { ArrowUpRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ScrambleLabel } from "@/components/scramble-label";
export function ActionLink({
  href,
  children,
  primary = false,
  external = false,
}: {
  href: string;
  children: ReactNode;
  primary?: boolean;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`action-link ${primary ? "primary" : ""}`}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
      {external ? <ArrowUpRight size={16} /> : <ArrowRight size={16} />}
    </Link>
  );
}
export function SectionHeading({
  number,
  label,
  title,
  children,
}: {
  number: string;
  label: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">
          <span>{number}</span> / <ScrambleLabel text={label} />
        </p>
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}

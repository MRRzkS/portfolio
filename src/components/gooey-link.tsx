import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function GooeyLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="circle-link gooey-link" aria-label={label}>
      <ArrowUpRight size={30} />
    </Link>
  );
}

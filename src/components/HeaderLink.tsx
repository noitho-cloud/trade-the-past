"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";

export function HeaderLink() {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const isEventPage = pathname.startsWith("/event/");
  const fromScope = searchParams.get("from_scope");
  const href =
    isEventPage && fromScope === "local" ? "/?scope=local" : "/";

  return (
    <Link href={href} className="group rounded focus-visible:ring-2 focus-visible:ring-[var(--etoro-green)] focus-visible:outline-none">
      <h1 className="text-lg font-bold tracking-tight text-white">
        Trade the Past
      </h1>
    </Link>
  );
}

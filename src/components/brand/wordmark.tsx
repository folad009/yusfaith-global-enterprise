import Image from "next/image";
import Link from "next/link";

export function Wordmark({
  href = "/",
  compact = false,
}: {
  tone?: "dark" | "light";
  href?: string;
  compact?: boolean;
}) {
  return (
    <Link href={href} aria-label="YUSFAITH Global Enterprises" className="inline-flex shrink-0">
      <Image
        src="/brand/yusfaith-logo.png"
        alt=""
        width={751}
        height={486}
        priority={!compact}
        className={compact ? "h-10 w-10 object-cover object-top" : "h-16 w-auto"}
      />
    </Link>
  );
}

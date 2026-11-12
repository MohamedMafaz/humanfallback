import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({
  size = 30,
  withWordmark = false,
  className,
}: {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
        <defs>
          <linearGradient id="hf-g" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FF9A66" />
            <stop offset="0.55" stopColor="#FF5A1F" />
            <stop offset="1" stopColor="#E8410A" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="12" fill="url(#hf-g)" />
        <circle cx="20" cy="15" r="4.1" fill="#fff" />
        <path
          d="M11.6 30.2c0-4.3 3.7-7.2 8.4-7.2s8.4 2.9 8.4 7.2"
          stroke="#fff"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <circle cx="30.4" cy="10.2" r="3.6" fill="#C9F26C" stroke="#fff" strokeWidth="1.6" />
      </svg>
      {withWordmark ? (
        <span className="text-[17px] font-semibold tracking-[-0.03em]">
          Human<span className="text-brand">Fallback</span>
        </span>
      ) : null}
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5", className)}>
      <Logo size={30} withWordmark />
    </Link>
  );
}

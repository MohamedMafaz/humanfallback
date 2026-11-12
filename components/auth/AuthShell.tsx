import type { ReactNode } from "react";
import { BadgeCheck, CreditCard, ScanEye } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[linear-gradient(135deg,#ff9a63_0%,#ff6b35_45%,#ef4a0d_100%)] p-3 md:p-7">
      <div className="w-full max-w-[1100px] rounded-[34px] bg-white p-2.5 shadow-[0_60px_120px_-50px_rgba(90,30,0,0.6)] md:p-3.5">
        <div className="grid gap-3 md:grid-cols-[1fr_0.92fr]">
          <div className="px-4 py-8 md:px-9 md:py-10">{children}</div>

          <div className="relative hidden min-h-[580px] overflow-hidden rounded-[26px] bg-[#ff5a1f] md:block">
            <div className="aurora" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,90,31,0.05)_30%,rgba(120,30,0,0.55)_100%)]" />

            <div className="relative flex h-full flex-col justify-between p-6">
              <div className="flex flex-wrap gap-2">
                {[
                  { icon: BadgeCheck, label: "Verified humans" },
                  { icon: CreditCard, label: "PayPal payments" },
                  { icon: ScanEye, label: "AI evidence checks" },
                ].map((chip) => (
                  <span
                    key={chip.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-white/15 px-3 py-1.5 text-[11.5px] font-medium text-white backdrop-blur"
                  >
                    <chip.icon size={12} /> {chip.label}
                  </span>
                ))}
              </div>

              <div className="rounded-[22px] border border-white/25 bg-white/15 p-5 backdrop-blur-md">
                <p className="text-[21px] font-medium leading-[1.25] tracking-[-0.02em] text-white">
                  “My agent handles the research. When it needs something in the physical world, it
                  hires a person — and pays them before I even open my laptop.”
                </p>
                <div className="mt-4 border-t border-white/25 pt-3">
                  <p className="text-[12.5px] font-medium text-white">Alex Rivera</p>
                  <p className="text-[11px] text-white/70">Head of Operations, Northwind Labs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <Logo size={36} />
      <h1 className="mt-6 text-[34px] font-semibold leading-[1.05] tracking-[-0.04em]">{title}</h1>
      <p className="mt-2 max-w-[380px] text-[13.5px] leading-relaxed text-muted">{subtitle}</p>
    </div>
  );
}

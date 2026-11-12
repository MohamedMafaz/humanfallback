import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col justify-between gap-3 px-1 pt-1 md:flex-row md:items-end">
      <div>
        {eyebrow ? (
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-brand">{eyebrow}</p>
        ) : null}
        <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.035em] md:text-[30px]">
          {title}
        </h1>
        {subtitle ? <p className="mt-1 max-w-[640px] text-[12.5px] text-muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

import type { ReactNode } from 'react';

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function SectionHeader({ eyebrow, title, description, action }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex-1">
        {eyebrow ? <div className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-clay">{eyebrow}</div> : null}
        <h2 className="text-2xl font-black text-ink">{title}</h2>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-cocoa">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

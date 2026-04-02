type BadgeTone = 'neutral' | 'success' | 'warning' | 'soft';

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
};

const toneStyles: Record<BadgeTone, string> = {
  neutral: 'bg-stone text-cocoa',
  success: 'bg-ember/15 text-emberStrong',
  warning: 'bg-parchment text-cocoa',
  soft: 'bg-sand text-cocoa'
};

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  return <span className={['inline-flex self-start rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]', toneStyles[tone]].join(' ')}>{label}</span>;
}

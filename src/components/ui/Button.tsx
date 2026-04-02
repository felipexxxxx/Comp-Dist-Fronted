import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'solid' | 'outline' | 'soft' | 'ghost';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  icon?: ReactNode;
};

const variantStyles: Record<ButtonVariant, { container: string; text: string }> = {
  solid: {
    container: 'bg-ember border border-emberStrong',
    text: 'text-white'
  },
  outline: {
    container: 'border border-ember bg-transparent',
    text: 'text-emberStrong'
  },
  soft: {
    container: 'bg-parchment border border-parchment',
    text: 'text-emberStrong'
  },
  ghost: {
    container: 'bg-transparent border border-transparent',
    text: 'text-cocoa'
  }
};

export function Button({ label, variant = 'solid', fullWidth = false, icon, className = '', ...props }: ButtonProps) {
  const styles = variantStyles[variant];

  return (
    <button
      className={[
        'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black uppercase tracking-[0.18em] shadow-soft transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-50',
        fullWidth ? 'w-full' : '',
        styles.container,
        styles.text,
        className
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {icon}
      {label}
    </button>
  );
}

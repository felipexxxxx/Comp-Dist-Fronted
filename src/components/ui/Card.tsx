import type { PropsWithChildren } from 'react';

type CardProps = PropsWithChildren<{
  className?: string;
}>;

export function Card({ children, className = '' }: CardProps) {
  return <section className={['rounded-3xl border border-stone bg-panel p-5 shadow-soft', className].join(' ')}>{children}</section>;
}

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-mist bg-white/70 px-5 py-6">
      <div className="text-lg font-black text-ink">{title}</div>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-cocoa">{description}</p>
    </div>
  );
}

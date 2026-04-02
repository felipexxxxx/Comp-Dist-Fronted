type StatCardProps = {
  label: string;
  value: string;
  note: string;
};

export function StatCard({ label, value, note }: StatCardProps) {
  return (
    <section className="flex-1 rounded-3xl border border-stone bg-panelSoft p-5 shadow-soft">
      <div className="text-xs font-bold uppercase tracking-[0.3em] text-clay">{label}</div>
      <div className="mt-3 text-4xl font-black text-ink">{value}</div>
      <p className="mt-2 text-sm leading-6 text-cocoa">{note}</p>
    </section>
  );
}

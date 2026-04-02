type Option<T extends string> = {
  label: string;
  value: T;
  description?: string;
};

type SegmentedControlProps<T extends string> = {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<Option<T>>;
};

export function SegmentedControl<T extends string>({ label, value, onChange, options }: SegmentedControlProps<T>) {
  return (
    <div className="grid gap-2">
      <div className="text-sm font-bold text-ink">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              className={[
                'min-w-[128px] flex-1 rounded-2xl border px-4 py-3 text-left transition',
                active ? 'border-ember bg-parchment' : 'border-stone bg-white'
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onChange(option.value)}
            >
              <div className={['text-sm font-black', active ? 'text-emberStrong' : 'text-ink'].join(' ')}>{option.label}</div>
              {option.description ? <div className="mt-1 text-xs leading-5 text-cocoa">{option.description}</div> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

type BaseProps = {
  label: string;
  error?: string;
  hint?: string;
  multiline?: boolean;
};

type InputProps = BaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'rows'> & {
    rows?: number;
  };

export function Input({ label, error, hint, multiline, rows = 4, className = '', ...props }: InputProps) {
  const sharedClassName =
    'w-full rounded-2xl border border-mist bg-white px-4 py-3 text-base text-ink outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/20';

  return (
    <label className="grid gap-2">
      <div className="flex items-end justify-between gap-3">
        <span className="text-sm font-bold text-ink">{label}</span>
        {hint ? <span className="text-xs font-medium text-cocoa">{hint}</span> : null}
      </div>
      {multiline ? (
        <textarea {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)} className={[sharedClassName, className].join(' ')} rows={rows} />
      ) : (
        <input {...(props as InputHTMLAttributes<HTMLInputElement>)} className={[sharedClassName, className].join(' ')} />
      )}
      {error ? <span className="text-xs font-medium text-red-700">{error}</span> : null}
    </label>
  );
}

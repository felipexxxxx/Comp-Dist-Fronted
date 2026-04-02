import type { PropsWithChildren } from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { BrandMark } from './BrandMark';

type AppShellProps = PropsWithChildren<{
  currentRoute: string;
  title: string;
  subtitle: string;
  userName: string;
  apiModeLabel: string;
  isMock: boolean;
  onNavigate: (route: string) => void;
  onLogout: () => void;
  onToggleTheme: () => void;
  theme: 'light' | 'dark';
}>;

const navItems = [
  { key: '/dashboard', label: 'Dashboard' },
  { key: '/users', label: 'Usuarios' },
  { key: '/patients', label: 'Pacientes' }
];

export function AppShell({
  children,
  currentRoute,
  title,
  subtitle,
  userName,
  apiModeLabel,
  isMock,
  onNavigate,
  onLogout,
  onToggleTheme,
  theme
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="flex min-h-screen flex-col xl:flex-row">
        <aside className="border-b border-[var(--border)] bg-[var(--panel)]/95 px-5 py-5 xl:min-h-full xl:w-[320px] xl:border-b-0 xl:border-r">
          <div className="flex h-full flex-col gap-6">
            <BrandMark />

            <section className="rounded-3xl border border-[var(--border)] bg-sand p-4">
              <div className="text-xs font-bold uppercase tracking-[0.28em] text-clay">Sessao ativa</div>
              <div className="mt-2 text-lg font-black text-ink">{userName}</div>
              <p className="mt-1 text-sm text-cocoa">Acesso administrativo e operacional para o MVP das semanas 1-4.</p>
            </section>

            <nav className="grid gap-2">
              {navItems.map((item) => {
                const active = item.key === currentRoute;

                return (
                  <button
                    key={item.key}
                    type="button"
                    className={[
                      'rounded-2xl border px-4 py-4 text-left transition',
                      active ? 'border-ember bg-parchment' : 'border-[var(--border)] bg-white'
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => onNavigate(item.key)}
                  >
                    <div className={['text-sm font-black', active ? 'text-emberStrong' : 'text-ink'].join(' ')}>{item.label}</div>
                  </button>
                );
              })}
            </nav>

            <section className="rounded-3xl border border-[var(--border)] bg-panelSoft p-4">
              <div className="text-xs font-bold uppercase tracking-[0.28em] text-clay">API</div>
              <div className="mt-2 text-sm font-bold text-ink">{apiModeLabel}</div>
              <p className="mt-1 text-xs leading-5 text-cocoa">Base configuravel via `VITE_API_BASE_URL`. O front usa mock local quando a URL nao esta definida.</p>
              <div className="mt-4">
                <Badge label={isMock ? 'Modo demo' : 'Modo HTTP'} tone={isMock ? 'soft' : 'success'} />
              </div>
            </section>

            <div className="grid gap-3">
              <Button label={theme === 'light' ? 'Tema escuro' : 'Tema claro'} variant="outline" onClick={onToggleTheme} fullWidth />
              <Button label="Sair" variant="ghost" onClick={onLogout} fullWidth />
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <div className="border-b border-[var(--border)] bg-[var(--panel)]/90 px-4 py-5 shadow-soft md:px-6 lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl gap-2">
                <div className="text-xs font-bold uppercase tracking-[0.3em] text-clay">HealthSys Distribuido</div>
                <h1 className="text-3xl font-black text-ink md:text-4xl">{title}</h1>
                <p className="text-sm leading-6 text-cocoa md:text-base">{subtitle}</p>
              </div>

              <section className="rounded-2xl border border-[var(--border)] bg-sand px-4 py-3">
                <div className="text-xs font-bold uppercase tracking-[0.28em] text-clay">Ambiente</div>
                <div className="mt-1 text-sm font-bold text-ink">{apiModeLabel}</div>
              </section>
            </div>
          </div>

          <div className="px-4 py-5 md:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

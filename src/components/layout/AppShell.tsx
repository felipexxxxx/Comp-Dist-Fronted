import { useState, type PropsWithChildren } from 'react';
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
  navItems: Array<{ key: string; label: string }>;
  onNavigate: (route: string) => void;
  onLogout: () => Promise<void> | void;
  onToggleTheme: () => void;
  theme: 'light' | 'dark';
}>;

export function AppShell({
  children,
  currentRoute,
  title,
  subtitle,
  userName,
  apiModeLabel,
  isMock,
  navItems,
  onNavigate,
  onLogout,
  onToggleTheme,
  theme
}: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const environmentBadge = (
    <Badge label={isMock ? 'Ambiente local' : 'Servicos online'} tone={isMock ? 'soft' : 'success'} />
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--panel)]/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <BrandMark />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleTheme}
              className="rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-bold text-ink transition hover:bg-sand"
            >
              {theme === 'light' ? 'Tema' : 'Claro'}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((current) => !current)}
              className="rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-bold text-ink transition hover:bg-sand"
              aria-label="Menu"
            >
              {mobileMenuOpen ? 'Fechar' : 'Menu'}
            </button>
          </div>
        </div>

        <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {navItems.map((item) => {
            const active = item.key === currentRoute;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  onNavigate(item.key);
                  setMobileMenuOpen(false);
                }}
                className={[
                  'shrink-0 rounded-xl border px-4 py-2 text-sm font-bold transition',
                  active ? 'border-ember bg-parchment text-emberStrong' : 'border-[var(--border)] bg-white text-ink'
                ].join(' ')}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {mobileMenuOpen ? (
          <div className="mt-3 grid gap-3 rounded-2xl border border-[var(--border)] bg-panelSoft p-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.28em] text-clay">Sessao ativa</div>
              <div className="mt-1 text-sm font-black text-ink">{userName}</div>
            </div>
            <div className="flex items-center justify-between gap-3">
              {environmentBadge}
              <span className="text-xs text-cocoa">{apiModeLabel}</span>
            </div>
            <Button
              label="Sair"
              variant="ghost"
              onClick={() => {
                void onLogout();
              }}
              fullWidth
            />
          </div>
        ) : null}
      </header>

      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="hidden flex-col border-r border-[var(--border)] bg-[var(--panel)]/95 px-5 py-5 lg:flex lg:min-h-screen lg:w-[260px] xl:w-[300px]">
          <div className="flex h-full flex-col gap-6">
            <BrandMark />

            <section className="rounded-3xl border border-[var(--border)] bg-sand p-4">
              <div className="text-xs font-bold uppercase tracking-[0.28em] text-clay">Sessao ativa</div>
              <div className="mt-2 text-lg font-black text-ink">{userName}</div>
              <p className="mt-1 text-sm text-cocoa">Acesso seguro ao painel operacional do hospital.</p>
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
                    ].join(' ')}
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
              <p className="mt-1 text-xs leading-5 text-cocoa">Sessao autenticada com persistencia e integracao preparada para os servicos distribuidos.</p>
              <div className="mt-4">{environmentBadge}</div>
            </section>

            <div className="mt-auto grid gap-3">
              <Button label={theme === 'light' ? 'Tema escuro' : 'Tema claro'} variant="outline" onClick={onToggleTheme} fullWidth />
              <Button
                label="Sair"
                variant="ghost"
                onClick={() => {
                  void onLogout();
                }}
                fullWidth
              />
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="border-b border-[var(--border)] bg-[var(--panel)]/90 px-4 py-5 shadow-soft md:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-3xl gap-2">
                <div className="text-xs font-bold uppercase tracking-[0.3em] text-clay">HealthSys Distribuido</div>
                <h1 className="text-2xl font-black text-ink sm:text-3xl md:text-4xl">{title}</h1>
                <p className="text-sm leading-6 text-cocoa md:text-base">{subtitle}</p>
              </div>

              <section className="shrink-0 rounded-2xl border border-[var(--border)] bg-sand px-4 py-3">
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

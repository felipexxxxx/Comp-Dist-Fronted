import { useEffect, useState } from 'react';

import { apiClient } from '../../services/api/client';
import type { DashboardSummary } from '../../services/api/types';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatCard } from '../../components/ui/StatCard';

const defaultSummary: DashboardSummary = {
  usersCount: null,
  activePatients: 0,
  inactivePatients: 0,
  waitingTriages: 0,
  inProgressTriages: 0,
  unreadNotifications: 0,
  systemLoad: 'Parcial'
};

export function DashboardScreen() {
  const [summary, setSummary] = useState<DashboardSummary>(defaultSummary);

  useEffect(() => {
    let mounted = true;

    apiClient.getDashboardSummary().then((nextSummary) => {
      if (mounted) {
        setSummary(nextSummary);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Usuarios ativos" value={summary.usersCount === null ? 'Restrito' : String(summary.usersCount)} note="Perfis cadastrados para as areas administrativa e clinica." />
        <StatCard label="Pacientes ativos" value={String(summary.activePatients)} note="Registros disponiveis para consultas e acompanhamento." />
        <StatCard label="Triagens aguardando" value={String(summary.waitingTriages)} note="Pacientes priorizados e aguardando atendimento." />
        <StatCard label="Notificacoes abertas" value={String(summary.unreadNotifications)} note="Eventos operacionais ainda nao marcados como lidos." />
      </div>

      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-3xl gap-2">
            <Badge label="Operacao assistencial" tone="soft" />
            <h2 className="text-2xl font-black text-ink">Fluxo distribuido do HealthSys em operacao</h2>
            <p className="text-sm leading-6 text-cocoa">
              O painel consolida pacientes, triagens e eventos assincronos para apoiar a rotina de recepcao, administracao e equipe clinica.
            </p>
          </div>

          <section className="rounded-3xl border border-stone bg-sand px-5 py-4">
            <div className="text-xs font-bold uppercase tracking-[0.28em] text-clay">Estado do sistema</div>
            <div className="mt-2 text-lg font-black text-ink">{summary.systemLoad}</div>
          </section>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="grid gap-3">
            <div className="text-xs font-bold uppercase tracking-[0.3em] text-clay">Pacientes</div>
            <h3 className="text-xl font-black text-ink">Cadastro preservado e rastreavel</h3>
            <p className="text-sm leading-6 text-cocoa">
              Ha {summary.activePatients} pacientes ativos e {summary.inactivePatients} registros inativos mantidos para historico, sem
              exclusao fisica.
            </p>
          </div>
        </Card>

        <Card>
          <div className="grid gap-3">
            <div className="text-xs font-bold uppercase tracking-[0.3em] text-clay">Triagem</div>
            <h3 className="text-xl font-black text-ink">Prioridades em acompanhamento</h3>
            <p className="text-sm leading-6 text-cocoa">
              Existem {summary.waitingTriages} triagens aguardando e {summary.inProgressTriages} em atendimento. Use o modulo de triagem
              para atualizar o andamento clinico.
            </p>
            <EmptyState
              title="Comunicacao operacional"
              description="As notificacoes refletem eventos recebidos da comunicacao assincrona entre os servicos."
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

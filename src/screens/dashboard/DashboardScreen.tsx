import { useEffect, useState } from 'react';

import { apiClient } from '../../services/api/client';
import type { DashboardSummary } from '../../services/api/types';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatCard } from '../../components/ui/StatCard';

const defaultSummary: DashboardSummary = {
  usersCount: 3,
  activePatients: 2,
  inactivePatients: 0,
  systemLoad: 'Carregando dados'
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
      <div className="flex flex-col gap-4 sm:flex-row">
        <StatCard label="Usuarios ativos" value={String(summary.usersCount)} note="Perfis cadastrados para as areas administrativa e clinica." />
        <StatCard label="Pacientes ativos" value={String(summary.activePatients)} note="Registros disponiveis para consultas e acompanhamento." />
        <StatCard label="Pacientes inativos" value={String(summary.inactivePatients)} note="Registros preservados para historico sem exclusao fisica." />
      </div>

      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-3xl gap-2">
            <Badge label="Semana 1-2 / 3-4" tone="soft" />
            <h2 className="text-2xl font-black text-ink">Base entregue para evolucao do HealthSys SaaS</h2>
            <p className="text-sm leading-6 text-cocoa">
              O dashboard resume o escopo ja construido e valida que o front suporta administracao inicial, autenticacao e o cadastro de
              pacientes com contrato pronto para o backend distribuido.
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
            <div className="text-xs font-bold uppercase tracking-[0.3em] text-clay">Entregavel concluido</div>
            <h3 className="text-xl font-black text-ink">Semana 1-2</h3>
            <p className="text-sm leading-6 text-cocoa">
              Estrutura da aplicacao, identidade visual, configuracao do ambiente web e camada de API pronta para uso local ou remoto.
            </p>
          </div>
        </Card>

        <Card>
          <div className="grid gap-3">
            <div className="text-xs font-bold uppercase tracking-[0.3em] text-clay">Entregavel concluido</div>
            <h3 className="text-xl font-black text-ink">Semana 3-4</h3>
            <p className="text-sm leading-6 text-cocoa">
              Fluxos de login, cadastro de usuarios, cadastro/edicao de pacientes e listagem prontos para consumo por backend real.
            </p>
            <EmptyState
              title="Proxima evolucao natural"
              description="Quando o backend distribuido estiver disponivel, basta apontar `VITE_API_BASE_URL` para consumir os endpoints reais sem mudar a UI."
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

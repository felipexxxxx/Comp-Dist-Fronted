import { useEffect, useMemo, useState } from 'react';

import { useAuthContext } from '../../contexts/AuthContext';
import { apiClient } from '../../services/api/client';
import type { CreateTriageInput, PatientRecord, TriagePriority, TriageRecord, TriageStatus } from '../../services/api/types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { SegmentedControl } from '../../components/ui/SegmentedControl';

type TriageFilter = TriageStatus | 'ALL';

const initialForm: CreateTriageInput = {
  patientId: '',
  patientName: '',
  priority: 'URGENT',
  chiefComplaint: '',
  notes: ''
};

const priorityOptions: Array<{ label: string; value: TriagePriority; description: string }> = [
  { label: 'Emergencia', value: 'EMERGENCY', description: 'Risco imediato' },
  { label: 'Muito urgente', value: 'VERY_URGENT', description: 'Atendimento rapido' },
  { label: 'Urgente', value: 'URGENT', description: 'Prioridade alta' },
  { label: 'Pouco urgente', value: 'LESS_URGENT', description: 'Pode aguardar' },
  { label: 'Nao urgente', value: 'NON_URGENT', description: 'Baixa prioridade' }
];

const filterOptions: Array<{ label: string; value: TriageFilter; description: string }> = [
  { label: 'Todas', value: 'ALL', description: 'Fila completa' },
  { label: 'Aguardando', value: 'WAITING', description: 'Sem atendimento' },
  { label: 'Em atendimento', value: 'IN_PROGRESS', description: 'Acompanhamento aberto' },
  { label: 'Concluidas', value: 'COMPLETED', description: 'Fluxo encerrado' }
];

const statusLabel: Record<TriageStatus, string> = {
  WAITING: 'Aguardando',
  IN_PROGRESS: 'Em atendimento',
  COMPLETED: 'Concluida',
  CANCELLED: 'Cancelada'
};

const priorityLabel: Record<TriagePriority, string> = {
  EMERGENCY: 'Emergencia',
  VERY_URGENT: 'Muito urgente',
  URGENT: 'Urgente',
  LESS_URGENT: 'Pouco urgente',
  NON_URGENT: 'Nao urgente'
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(value));
}

function getPriorityTone(priority: TriagePriority) {
  return priority === 'EMERGENCY' || priority === 'VERY_URGENT' ? 'warning' : priority === 'URGENT' ? 'success' : 'neutral';
}

export function TriagesScreen() {
  const { userName, userRole } = useAuthContext();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [triages, setTriages] = useState<TriageRecord[]>([]);
  const [form, setForm] = useState<CreateTriageInput>(initialForm);
  const [filter, setFilter] = useState<TriageFilter>('ALL');
  const [isSaving, setIsSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const canUpdateStatus = userRole === 'ADMIN' || userRole === 'HEALTH_PROFESSIONAL';
  const activePatients = useMemo(() => patients.filter((patient) => patient.active), [patients]);
  const filteredTriages = useMemo(
    () => triages.filter((triage) => (filter === 'ALL' ? true : triage.status === filter)),
    [filter, triages]
  );

  const loadData = async () => {
    const [nextPatients, nextTriages] = await Promise.all([apiClient.listPatients(), apiClient.listTriages()]);
    setPatients(nextPatients);
    setTriages(nextTriages);
  };

  useEffect(() => {
    loadData().catch((cause) => setError(cause instanceof Error ? cause.message : 'Falha ao carregar triagens'));
  }, []);

  const handlePatientChange = (patientId: string) => {
    const patient = patients.find((item) => item.id === patientId);
    setForm((current) => ({
      ...current,
      patientId,
      patientName: patient?.name ?? ''
    }));
  };

  const handleCreate = async () => {
    setError('');
    setMessage('');

    if (!form.patientId || !form.patientName || !form.chiefComplaint) {
      setError('Selecione o paciente e informe a queixa principal.');
      return;
    }

    setIsSaving(true);

    try {
      await apiClient.createTriage({
        patientId: form.patientId,
        patientName: form.patientName,
        priority: form.priority,
        chiefComplaint: form.chiefComplaint,
        notes: form.notes?.trim() || undefined
      });
      await loadData();
      setForm(initialForm);
      setMessage('Triagem registrada com sucesso.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nao foi possivel registrar a triagem.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (triage: TriageRecord, status: TriageStatus) => {
    setError('');
    setMessage('');
    setUpdatingId(triage.id);

    try {
      await apiClient.updateTriageStatus({
        id: triage.id,
        status,
        notes: triage.notes ?? undefined,
        attendedBy: userName
      });
      await loadData();
      setMessage(`Triagem de ${triage.patientName} atualizada para ${statusLabel[status].toLowerCase()}.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nao foi possivel atualizar a triagem.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="grid gap-6">
      <SectionHeader
        eyebrow="Atendimento inicial"
        title="Fila de triagem"
        description="Registre a queixa principal, classifique a prioridade e acompanhe o andamento do atendimento."
        action={<Badge label={`${triages.length} triagens`} tone="neutral" />}
      />

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.2fr]">
        <Card>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <h3 className="text-xl font-black text-ink">Nova triagem</h3>
              <p className="text-sm leading-6 text-cocoa">A recepcao pode abrir a triagem e a equipe clinica atualiza o andamento.</p>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-ink">Paciente</span>
              <select
                className="w-full rounded-2xl border border-mist bg-white px-4 py-3 text-base text-ink outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/20"
                value={form.patientId}
                onChange={(event) => handlePatientChange(event.target.value)}
              >
                <option value="">Selecione um paciente ativo</option>
                {activePatients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} - {patient.phone}
                  </option>
                ))}
              </select>
            </label>

            <SegmentedControl
              label="Prioridade"
              value={form.priority}
              onChange={(value) => setForm((current) => ({ ...current, priority: value }))}
              options={priorityOptions}
            />

            <Input
              label="Queixa principal"
              value={form.chiefComplaint}
              onChange={(event) => setForm((current) => ({ ...current, chiefComplaint: event.target.value }))}
              placeholder="Descreva o motivo do atendimento"
              multiline
              rows={3}
            />

            <Input
              label="Observacoes"
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Sinais, sintomas ou contexto relevante"
              multiline
              rows={3}
            />

            {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div> : null}
            {message ? <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">{message}</div> : null}

            <Button label={isSaving ? 'Registrando' : 'Registrar triagem'} onClick={handleCreate} disabled={isSaving} fullWidth />
          </div>
        </Card>

        <Card>
          <div className="grid gap-4">
            <div className="flex flex-col gap-3">
              <div>
                <h3 className="text-xl font-black text-ink">Acompanhamento da fila</h3>
                <p className="text-sm leading-6 text-cocoa">Use os filtros para visualizar a fila por status operacional.</p>
              </div>
              <SegmentedControl label="Filtro" value={filter} onChange={setFilter} options={filterOptions} />
            </div>

            {filteredTriages.length === 0 ? (
              <EmptyState title="Nenhuma triagem encontrada" description="Registre uma triagem ou altere o filtro selecionado." />
            ) : (
              <div className="grid gap-3">
                {filteredTriages.map((triage) => (
                  <div key={triage.id} className="rounded-2xl border border-stone bg-white px-4 py-4">
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                      <div className="grid gap-1">
                        <div className="text-base font-black text-ink">{triage.patientName}</div>
                        <div className="text-sm leading-6 text-cocoa">{triage.chiefComplaint}</div>
                      </div>
                      <div className="flex flex-wrap gap-2 md:justify-end">
                        <Badge label={priorityLabel[triage.priority]} tone={getPriorityTone(triage.priority)} />
                        <Badge label={statusLabel[triage.status]} tone={triage.status === 'COMPLETED' ? 'success' : 'neutral'} />
                      </div>
                    </div>

                    {triage.notes ? <p className="mt-3 text-sm leading-6 text-cocoa">{triage.notes}</p> : null}

                    <div className="mt-4 grid gap-2 text-xs uppercase tracking-[0.2em] text-clay md:grid-cols-2">
                      <span>Aberta em {formatDateTime(triage.createdAt)}</span>
                      <span>{triage.attendedBy ? `Responsavel: ${triage.attendedBy}` : 'Sem responsavel definido'}</span>
                    </div>

                    {canUpdateStatus ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {triage.status === 'WAITING' ? (
                          <Button
                            label="Iniciar"
                            variant="soft"
                            disabled={updatingId === triage.id}
                            onClick={() => {
                              void handleStatusChange(triage, 'IN_PROGRESS');
                            }}
                          />
                        ) : null}
                        {triage.status !== 'COMPLETED' && triage.status !== 'CANCELLED' ? (
                          <Button
                            label="Concluir"
                            variant="outline"
                            disabled={updatingId === triage.id}
                            onClick={() => {
                              void handleStatusChange(triage, 'COMPLETED');
                            }}
                          />
                        ) : null}
                        {triage.status === 'WAITING' ? (
                          <Button
                            label="Cancelar"
                            variant="ghost"
                            disabled={updatingId === triage.id}
                            onClick={() => {
                              void handleStatusChange(triage, 'CANCELLED');
                            }}
                          />
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

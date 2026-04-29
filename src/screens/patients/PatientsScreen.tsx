import { useEffect, useMemo, useState } from 'react';

import { apiClient } from '../../services/api/client';
import type { CreatePatientInput, PatientRecord, PatientSex, UpdatePatientInput } from '../../services/api/types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { SegmentedControl } from '../../components/ui/SegmentedControl';

const initialForm: CreatePatientInput = {
  name: '',
  birthDate: '',
  sex: 'FEMALE',
  phone: ''
};

const sexOptions: Array<{ label: string; value: PatientSex; description: string }> = [
  { label: 'Feminino', value: 'FEMALE', description: 'Registro base do paciente' },
  { label: 'Masculino', value: 'MALE', description: 'Registro base do paciente' },
  { label: 'Outro', value: 'OTHER', description: 'Registro base do paciente' }
];

const activeOptions: Array<{ label: string; value: 'ACTIVE' | 'INACTIVE'; description: string }> = [
  { label: 'Ativo', value: 'ACTIVE', description: 'Disponivel para atendimento' },
  { label: 'Inativo', value: 'INACTIVE', description: 'Preservado apenas para historico' }
];

export function PatientsScreen() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [form, setForm] = useState<CreatePatientInput>(initialForm);
  const [formActive, setFormActive] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const selectedPatient = useMemo(() => patients.find((patient) => patient.id === selectedPatientId) ?? null, [patients, selectedPatientId]);

  const loadPatients = async () => {
    const nextPatients = await apiClient.listPatients();
    setPatients(nextPatients);
  };

  useEffect(() => {
    loadPatients().catch((cause) => setError(cause instanceof Error ? cause.message : 'Falha ao carregar pacientes'));
  }, []);

  useEffect(() => {
    if (!selectedPatient) {
      return;
    }

    setForm({
      name: selectedPatient.name,
      birthDate: selectedPatient.birthDate,
      sex: selectedPatient.sex,
      phone: selectedPatient.phone
    });
    setFormActive(selectedPatient.active);
  }, [selectedPatient]);

  const resetForm = () => {
    setSelectedPatientId(null);
    setForm(initialForm);
    setFormActive(true);
  };

  const handleSubmit = async () => {
    setError('');
    setMessage('');

    if (!form.name || !form.birthDate || !form.phone) {
      setError('Preencha nome, data de nascimento e telefone.');
      return;
    }

    setIsSaving(true);

    try {
      if (selectedPatientId) {
        const payload: UpdatePatientInput = {
          id: selectedPatientId,
          ...form,
          active: formActive
        };
        await apiClient.updatePatient(payload);
        setMessage('Paciente atualizado com sucesso.');
      } else {
        await apiClient.createPatient(form);
        setMessage('Paciente cadastrado com sucesso.');
      }

      await loadPatients();
      resetForm();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nao foi possivel salvar o paciente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-6">
      <SectionHeader
        eyebrow="Cadastros"
        title="Pacientes, consulta e atualizacao"
        description="Cadastre pacientes, mantenha os contatos atualizados e inative registros quando necessario sem remover o historico."
        action={<Badge label={`${patients.length} registros`} tone="neutral" />}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <Card>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <h3 className="text-xl font-black text-ink">{selectedPatient ? 'Editar paciente' : 'Novo paciente'}</h3>
              <p className="text-sm leading-6 text-cocoa">Atualize dados pessoais e de contato usados pela recepcao e pela triagem clinica.</p>
            </div>

            <Input label="Nome completo" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Nome do paciente" />
            <Input
              label="Data de nascimento"
              value={form.birthDate}
              onChange={(event) => setForm((current) => ({ ...current, birthDate: event.target.value }))}
              placeholder="AAAA-MM-DD"
              type="date"
            />
            <Input label="Telefone" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="(85) 99999-0000" />

            <SegmentedControl
              label="Sexo"
              value={form.sex}
              onChange={(value) => setForm((current) => ({ ...current, sex: value }))}
              options={sexOptions}
            />

            {selectedPatient ? (
              <SegmentedControl
                label="Status cadastral"
                value={formActive ? 'ACTIVE' : 'INACTIVE'}
                onChange={(value) => setFormActive(value === 'ACTIVE')}
                options={activeOptions}
              />
            ) : null}

            {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div> : null}
            {message ? <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">{message}</div> : null}

            <div className="flex flex-wrap gap-3">
              <Button label={isSaving ? 'Salvando' : selectedPatient ? 'Atualizar' : 'Cadastrar'} onClick={handleSubmit} disabled={isSaving} />
              <Button label="Limpar" variant="outline" onClick={resetForm} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="grid gap-4">
            <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
              <div>
                <h3 className="text-xl font-black text-ink">Pacientes cadastrados</h3>
                <p className="text-sm leading-6 text-cocoa">Clique em um registro para editar os dados imediatamente.</p>
              </div>
              <Badge label={selectedPatient ? 'Em edicao' : 'Lista'} tone={selectedPatient ? 'warning' : 'neutral'} />
            </div>

            {patients.length === 0 ? (
              <EmptyState title="Nenhum paciente encontrado" description="Cadastre o primeiro paciente para liberar o fluxo de edicao." />
            ) : (
              <div className="grid gap-3">
                {patients.map((patient) => {
                  const active = patient.id === selectedPatientId;

                  return (
                    <div
                      key={patient.id}
                      className={['rounded-2xl border px-4 py-4', active ? 'border-ember bg-parchment' : 'border-stone bg-white']
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="grid gap-1">
                          <div className="text-base font-black text-ink">{patient.name}</div>
                          <div className="text-sm text-cocoa">{patient.phone}</div>
                        </div>
                        <Badge label={patient.active ? 'Ativo' : 'Inativo'} tone={patient.active ? 'success' : 'neutral'} />
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge label={patient.sex} tone="soft" />
                        <Badge label={patient.birthDate} tone="neutral" />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button label="Editar" variant="soft" onClick={() => setSelectedPatientId(patient.id)} />
                        <Button
                          label={patient.active ? 'Inativar' : 'Reativar'}
                          variant="outline"
                          onClick={async () => {
                            setError('');
                            setMessage('');
                            try {
                              await apiClient.updatePatient({
                                id: patient.id,
                                name: patient.name,
                                birthDate: patient.birthDate,
                                sex: patient.sex,
                                phone: patient.phone,
                                active: !patient.active
                              });
                              await loadPatients();
                              setMessage(patient.active ? 'Paciente inativado com sucesso.' : 'Paciente reativado com sucesso.');
                            } catch (cause) {
                              setError(cause instanceof Error ? cause.message : 'Nao foi possivel atualizar o status do paciente.');
                            }
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

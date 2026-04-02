import { useEffect, useState } from 'react';

import { apiClient } from '../../services/api/client';
import type { CreateUserInput, UserRecord, UserRole } from '../../services/api/types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { SegmentedControl } from '../../components/ui/SegmentedControl';

const initialForm: CreateUserInput = {
  name: '',
  email: '',
  role: 'RECEPTIONIST',
  password: ''
};

const profileOptions: Array<{ label: string; value: UserRole; description: string }> = [
  { label: 'Admin', value: 'ADMIN', description: 'Acessa configuracoes e usuarios' },
  { label: 'Saude', value: 'HEALTH_PROFESSIONAL', description: 'Consulta e registra dados clinicos' },
  { label: 'Atendimento', value: 'RECEPTIONIST', description: 'Cadastro e triagem inicial' }
];

export function UsersScreen() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [form, setForm] = useState<CreateUserInput>(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadUsers = async () => {
    const nextUsers = await apiClient.listUsers();
    setUsers(nextUsers);
  };

  useEffect(() => {
    loadUsers().catch((cause) => setError(cause instanceof Error ? cause.message : 'Falha ao carregar usuarios'));
  }, []);

  const handleCreate = async () => {
    setError('');
    setMessage('');

    if (!form.name || !form.email || !form.password) {
      setError('Preencha nome, e-mail e senha.');
      return;
    }

    setIsSaving(true);

    try {
      await apiClient.createUser(form);
      await loadUsers();
      setForm(initialForm);
      setMessage('Usuario criado com sucesso.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nao foi possivel criar o usuario.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-6">
      <SectionHeader
        eyebrow="Administracao"
        title="Cadastro e consulta de usuarios"
        description="Fluxo necessario para o administrador controlar perfis e manter o acesso ao sistema organizado."
        action={<Badge label={`${users.length} registros`} tone="neutral" />}
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_1.1fr]">
        <Card>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <h3 className="text-xl font-black text-ink">Novo usuario</h3>
              <p className="text-sm leading-6 text-cocoa">Essa tela entrega o requisito de criacao e listagem de perfis administrativos para a sprint 3-4.</p>
            </div>

            <Input label="Nome completo" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Nome do usuario" />
            <Input
              label="E-mail"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="usuario@healthsys.local"
              type="email"
            />
            <Input
              label="Senha inicial"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="Senha temporaria"
              type="password"
            />

            <SegmentedControl
              label="Perfil de acesso"
              value={form.role}
              onChange={(value) => setForm((current) => ({ ...current, role: value }))}
              options={profileOptions}
            />

            {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div> : null}
            {message ? <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">{message}</div> : null}

            <Button label={isSaving ? 'Salvando' : 'Criar usuario'} onClick={handleCreate} disabled={isSaving} fullWidth />
          </div>
        </Card>

        <Card>
          <div className="grid gap-4">
            <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
              <div>
                <h3 className="text-xl font-black text-ink">Usuarios cadastrados</h3>
                <p className="text-sm leading-6 text-cocoa">Lista persistida localmente no modo demo ou vinda da API real.</p>
              </div>
              <Badge label={apiClient.mode === 'mock' ? 'Mock' : 'HTTP'} tone={apiClient.mode === 'mock' ? 'soft' : 'success'} />
            </div>

            {users.length === 0 ? (
              <EmptyState title="Nenhum usuario encontrado" description="Crie o primeiro perfil no formulario ao lado." />
            ) : (
              <div className="grid gap-3">
                {users.map((user) => (
                  <div key={user.id} className="rounded-2xl border border-stone bg-white px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="grid gap-1">
                        <div className="text-base font-black text-ink">{user.name}</div>
                        <div className="text-sm text-cocoa">{user.email}</div>
                      </div>
                      <Badge label={user.role} tone={user.role === 'ADMIN' ? 'warning' : 'neutral'} />
                    </div>
                    <div className="mt-3 text-xs uppercase tracking-[0.24em] text-clay">{user.active ? 'ATIVO' : 'INATIVO'}</div>
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

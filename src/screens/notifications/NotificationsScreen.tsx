import { useEffect, useMemo, useState } from 'react';

import { apiClient } from '../../services/api/client';
import type { NotificationRecord } from '../../services/api/types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { SectionHeader } from '../../components/layout/SectionHeader';
import { SegmentedControl } from '../../components/ui/SegmentedControl';

type NotificationFilter = 'ALL' | 'UNREAD';

const filterOptions: Array<{ label: string; value: NotificationFilter; description: string }> = [
  { label: 'Todas', value: 'ALL', description: 'Historico completo' },
  { label: 'Nao lidas', value: 'UNREAD', description: 'Pendencias operacionais' }
];

const eventLabels: Record<string, string> = {
  USER_CREATED: 'Usuario criado',
  PATIENT_CREATED: 'Paciente cadastrado',
  PATIENT_UPDATED: 'Paciente atualizado',
  TRIAGE_CREATED: 'Triagem registrada',
  TRIAGE_UPDATED: 'Triagem atualizada'
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(value));
}

function formatEvent(eventType: string) {
  return eventLabels[eventType] ?? eventType.replace(/_/g, ' ').toLowerCase();
}

function parsePayload(payload: string) {
  try {
    return JSON.parse(payload) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function describeNotification(notification: NotificationRecord) {
  const parsedPayload = parsePayload(notification.payload);
  const payload = parsedPayload?.payload;

  if (payload && typeof payload === 'object') {
    const data = payload as Record<string, unknown>;
    const patientName = typeof data.patientName === 'string' ? data.patientName : null;
    const patient = typeof data.name === 'string' ? data.name : null;
    const priority = typeof data.priority === 'string' ? data.priority : null;
    const status = typeof data.status === 'string' ? data.status : null;

    if (patientName && priority) {
      return `${patientName} foi classificado com prioridade ${priority}.`;
    }

    if (patientName && status) {
      return `${patientName} teve a triagem atualizada para ${status}.`;
    }

    if (patient) {
      return `${patient} teve o cadastro atualizado no sistema.`;
    }
  }

  return `Evento recebido pela rota ${notification.routingKey}.`;
}

export function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [filter, setFilter] = useState<NotificationFilter>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const unreadCount = useMemo(() => notifications.filter((notification) => notification.status === 'UNREAD').length, [notifications]);

  const loadNotifications = async (nextFilter = filter) => {
    const nextNotifications = await apiClient.listNotifications(nextFilter === 'UNREAD');
    setNotifications(nextNotifications);
  };

  useEffect(() => {
    setIsLoading(true);
    loadNotifications(filter)
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Falha ao carregar notificacoes'))
      .finally(() => setIsLoading(false));
  }, [filter]);

  const handleMarkAsRead = async (notification: NotificationRecord) => {
    setError('');
    setMessage('');
    setUpdatingId(notification.id);

    try {
      await apiClient.markNotificationAsRead(notification.id);
      await loadNotifications();
      setMessage('Notificacao marcada como lida.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Nao foi possivel atualizar a notificacao.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="grid gap-6">
      <SectionHeader
        eyebrow="Comunicacao assincrona"
        title="Central de notificacoes"
        description="Acompanhe eventos gerados pelos servicos distribuidos e marque como lidos os itens ja tratados pela equipe."
        action={<Badge label={`${unreadCount} abertas`} tone={unreadCount > 0 ? 'warning' : 'success'} />}
      />

      <Card>
        <div className="grid gap-4">
          <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-end">
            <div>
              <h3 className="text-xl font-black text-ink">Eventos recebidos</h3>
              <p className="text-sm leading-6 text-cocoa">Os registros refletem mensagens processadas pelo servico de notificacao.</p>
            </div>
            <div className="min-w-[280px]">
              <SegmentedControl label="Filtro" value={filter} onChange={setFilter} options={filterOptions} />
            </div>
          </div>

          {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div> : null}
          {message ? <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">{message}</div> : null}

          {isLoading ? (
            <div className="rounded-2xl border border-stone bg-white px-4 py-5 text-sm font-bold text-cocoa">Carregando notificacoes...</div>
          ) : notifications.length === 0 ? (
            <EmptyState title="Nenhuma notificacao encontrada" description="Novos eventos aparecerao aqui conforme os servicos forem processando mensagens." />
          ) : (
            <div className="grid gap-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="rounded-2xl border border-stone bg-white px-4 py-4">
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div className="grid gap-2">
                      <div className="text-base font-black text-ink">{formatEvent(notification.eventType)}</div>
                      <p className="text-sm leading-6 text-cocoa">{describeNotification(notification)}</p>
                    </div>
                    <Badge label={notification.status === 'UNREAD' ? 'Nao lida' : 'Lida'} tone={notification.status === 'UNREAD' ? 'warning' : 'success'} />
                  </div>

                  <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="text-xs uppercase tracking-[0.2em] text-clay">
                      Recebida em {formatDateTime(notification.occurredAt)}
                    </div>

                    {notification.status === 'UNREAD' ? (
                      <Button
                        label="Marcar como lida"
                        variant="outline"
                        disabled={updatingId === notification.id}
                        onClick={() => {
                          void handleMarkAsRead(notification);
                        }}
                      />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

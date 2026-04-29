import type {
  AuthSession,
  CreatePatientInput,
  CreateTriageInput,
  CreateUserInput,
  DashboardSummary,
  HealthSysApi,
  LoginInput,
  NotificationRecord,
  PatientRecord,
  TriageRecord,
  UpdatePatientInput,
  UpdateTriageStatusInput,
  UserRole,
  UserRecord
} from './types';
import { createId, readJson, writeJson } from './storage';

const USERS_KEY = 'healthsys-users';
const PATIENTS_KEY = 'healthsys-patients';
const TRIAGES_KEY = 'healthsys-triages';
const NOTIFICATIONS_KEY = 'healthsys-notifications';

type StoredUserRecord = UserRecord & {
  password: string;
};

const initialUsers: StoredUserRecord[] = [
  {
    id: 'usr-admin',
    name: 'Felipe de Paula',
    email: 'admin@healthsys.local',
    role: 'ADMIN',
    active: true,
    password: 'Admin@123',
    createdAt: '2026-03-25T08:00:00.000Z'
  },
  {
    id: 'usr-med',
    name: 'Larissa Elias',
    email: 'larissa@healthsys.local',
    role: 'HEALTH_PROFESSIONAL',
    active: true,
    password: 'Med@12345',
    createdAt: '2026-03-25T08:20:00.000Z'
  },
  {
    id: 'usr-front',
    name: 'Salomao Vasques',
    email: 'front@healthsys.local',
    role: 'RECEPTIONIST',
    active: true,
    password: 'Recep@123',
    createdAt: '2026-03-25T08:40:00.000Z'
  }
];

const initialPatients: PatientRecord[] = [
  {
    id: 'pat-001',
    name: 'Maria Silva',
    birthDate: '1985-04-12',
    sex: 'FEMALE',
    phone: '(85) 99999-1001',
    active: true,
    createdAt: '2026-03-25T09:00:00.000Z'
  },
  {
    id: 'pat-002',
    name: 'Joao Pereira',
    birthDate: '1978-09-30',
    sex: 'MALE',
    phone: '(85) 98888-2002',
    active: true,
    createdAt: '2026-03-25T09:10:00.000Z'
  }
];

const initialTriages: TriageRecord[] = [
  {
    id: 'tri-001',
    patientId: 'pat-001',
    patientName: 'Maria Silva',
    priority: 'URGENT',
    status: 'WAITING',
    chiefComplaint: 'Dor toracica e falta de ar',
    notes: 'Paciente orientada, aguardando avaliacao medica.',
    attendedBy: null,
    createdAt: '2026-04-08T10:30:00.000Z',
    updatedAt: '2026-04-08T10:30:00.000Z',
    attendedAt: null
  },
  {
    id: 'tri-002',
    patientId: 'pat-002',
    patientName: 'Joao Pereira',
    priority: 'LESS_URGENT',
    status: 'IN_PROGRESS',
    chiefComplaint: 'Febre persistente',
    notes: 'Sinais vitais estaveis.',
    attendedBy: 'Larissa Elias',
    createdAt: '2026-04-08T11:20:00.000Z',
    updatedAt: '2026-04-08T11:35:00.000Z',
    attendedAt: '2026-04-08T11:35:00.000Z'
  }
];

const initialNotifications: NotificationRecord[] = [
  {
    id: 'not-001',
    eventType: 'TRIAGE_CREATED',
    resourceId: 'tri-001',
    routingKey: 'healthsys.triage.created',
    payload: JSON.stringify({ eventType: 'TRIAGE_CREATED', payload: { patientName: 'Maria Silva', priority: 'URGENT' } }),
    status: 'UNREAD',
    occurredAt: '2026-04-08T10:30:00.000Z',
    readAt: null
  }
];

function seedUsers() {
  const users = readJson<StoredUserRecord[]>(USERS_KEY, []);
  if (users.length > 0) {
    return users;
  }

  writeJson(USERS_KEY, initialUsers);
  return initialUsers;
}

function seedPatients() {
  const patients = readJson<PatientRecord[]>(PATIENTS_KEY, []);
  if (patients.length > 0) {
    return patients;
  }

  writeJson(PATIENTS_KEY, initialPatients);
  return initialPatients;
}

function seedTriages() {
  const triages = readJson<TriageRecord[]>(TRIAGES_KEY, []);
  if (triages.length > 0) {
    return triages;
  }

  writeJson(TRIAGES_KEY, initialTriages);
  return initialTriages;
}

function seedNotifications() {
  const notifications = readJson<NotificationRecord[]>(NOTIFICATIONS_KEY, []);
  if (notifications.length > 0) {
    return notifications;
  }

  writeJson(NOTIFICATIONS_KEY, initialNotifications);
  return initialNotifications;
}

function persistUsers(users: StoredUserRecord[]) {
  writeJson(USERS_KEY, users);
}

function persistPatients(patients: PatientRecord[]) {
  writeJson(PATIENTS_KEY, patients);
}

function persistTriages(triages: TriageRecord[]) {
  writeJson(TRIAGES_KEY, triages);
}

function persistNotifications(notifications: NotificationRecord[]) {
  writeJson(NOTIFICATIONS_KEY, notifications);
}

function createNotification(eventType: string, resourceId: string, payload: object) {
  const notifications = seedNotifications();
  const notification: NotificationRecord = {
    id: createId('not-'),
    eventType,
    resourceId,
    routingKey: `healthsys.${eventType.toLowerCase().replace(/_/g, '.')}`,
    payload: JSON.stringify({ eventType, resourceId, payload }),
    status: 'UNREAD',
    occurredAt: new Date().toISOString(),
    readAt: null
  };

  persistNotifications([notification, ...notifications]);
}

function normalizeRole(role: string): UserRole {
  if (role === 'ADMIN' || role === 'HEALTH_PROFESSIONAL' || role === 'RECEPTIONIST') {
    return role;
  }

  return 'RECEPTIONIST';
}

function buildSession(user: UserRecord): AuthSession {
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString();

  return {
    token: `mock-${user.id}-${Date.now().toString(36)}`,
    tokenType: 'Bearer',
    expiresAt,
    user
  };
}

function stripPassword(user: StoredUserRecord): UserRecord {
  const { password, ...safeUser } = user;
  return safeUser;
}

export function createMockHealthSysApi(): HealthSysApi {
  return {
    mode: 'mock',
    baseUrl: 'local-storage',

    async login(input: LoginInput) {
      const users = seedUsers();
      const matchedUser = users.find((user) => user.email.toLowerCase() === input.email.toLowerCase() && user.password === input.password);

      if (!matchedUser) {
        throw new Error('Credenciais invalidas.');
      }

      return buildSession(stripPassword(matchedUser));
    },

    async logout() {
      return undefined;
    },

    async getDashboardSummary(): Promise<DashboardSummary> {
      const users = seedUsers();
      const patients = seedPatients();
      const activePatients = patients.filter((patient) => patient.active).length;
      const inactivePatients = patients.filter((patient) => !patient.active).length;

      return {
        usersCount: users.length,
        activePatients,
        inactivePatients,
        waitingTriages: seedTriages().filter((triage) => triage.status === 'WAITING').length,
        inProgressTriages: seedTriages().filter((triage) => triage.status === 'IN_PROGRESS').length,
        unreadNotifications: seedNotifications().filter((notification) => notification.status === 'UNREAD').length,
        systemLoad: 'Online'
      };
    },

    async listUsers() {
      return seedUsers().map(stripPassword);
    },

    async createUser(input: CreateUserInput) {
      const users = seedUsers();
      const nextUser: StoredUserRecord = {
        id: createId('usr-'),
        name: input.name,
        email: input.email,
        role: normalizeRole(input.role),
        active: true,
        password: input.password,
        createdAt: new Date().toISOString()
      };

      const nextUsers = [nextUser, ...users];
      persistUsers(nextUsers);
      createNotification('USER_CREATED', nextUser.id, { name: nextUser.name, email: nextUser.email, role: nextUser.role });
      return stripPassword(nextUser);
    },

    async listPatients() {
      return seedPatients();
    },

    async createPatient(input: CreatePatientInput) {
      const patients = seedPatients();
      const now = new Date().toISOString();
      const nextPatient: PatientRecord = {
        id: createId('pat-'),
        name: input.name,
        birthDate: input.birthDate,
        sex: input.sex,
        phone: input.phone,
        active: true,
        createdAt: now
      };

      const nextPatients = [nextPatient, ...patients];
      persistPatients(nextPatients);
      createNotification('PATIENT_CREATED', nextPatient.id, { name: nextPatient.name });
      return nextPatient;
    },

    async updatePatient(input: UpdatePatientInput) {
      const patients = seedPatients();
      const now = new Date().toISOString();
      const nextPatient: PatientRecord = {
        id: input.id,
        name: input.name,
        birthDate: input.birthDate,
        sex: input.sex,
        phone: input.phone,
        active: input.active,
        createdAt: patients.find((patient) => patient.id === input.id)?.createdAt ?? now
      };

      const nextPatients = patients.map((patient) => (patient.id === input.id ? nextPatient : patient));
      persistPatients(nextPatients);
      createNotification('PATIENT_UPDATED', nextPatient.id, { name: nextPatient.name, active: nextPatient.active });
      return nextPatient;
    },

    async listTriages() {
      return seedTriages();
    },

    async createTriage(input: CreateTriageInput) {
      const triages = seedTriages();
      const now = new Date().toISOString();
      const nextTriage: TriageRecord = {
        id: createId('tri-'),
        patientId: input.patientId,
        patientName: input.patientName,
        priority: input.priority,
        status: 'WAITING',
        chiefComplaint: input.chiefComplaint,
        notes: input.notes || null,
        attendedBy: null,
        createdAt: now,
        updatedAt: now,
        attendedAt: null
      };

      persistTriages([nextTriage, ...triages]);
      createNotification('TRIAGE_CREATED', nextTriage.id, { patientName: nextTriage.patientName, priority: nextTriage.priority });
      return nextTriage;
    },

    async updateTriageStatus(input: UpdateTriageStatusInput) {
      const triages = seedTriages();
      const now = new Date().toISOString();
      const updatedTriages = triages.map((triage) => {
        if (triage.id !== input.id) {
          return triage;
        }

        return {
          ...triage,
          status: input.status,
          notes: input.notes ?? triage.notes,
          attendedBy: input.attendedBy ?? triage.attendedBy,
          updatedAt: now,
          attendedAt: input.status === 'IN_PROGRESS' && !triage.attendedAt ? now : triage.attendedAt
        };
      });
      const updated = updatedTriages.find((triage) => triage.id === input.id);

      if (!updated) {
        throw new Error('Triagem nao encontrada.');
      }

      persistTriages(updatedTriages);
      createNotification('TRIAGE_UPDATED', updated.id, { patientName: updated.patientName, status: updated.status });
      return updated;
    },

    async listNotifications(unread?: boolean) {
      const notifications = seedNotifications();
      return unread ? notifications.filter((notification) => notification.status === 'UNREAD') : notifications;
    },

    async markNotificationAsRead(id: string) {
      const notifications = seedNotifications();
      const now = new Date().toISOString();
      const nextNotifications = notifications.map((notification) =>
        notification.id === id ? { ...notification, status: 'READ' as const, readAt: now } : notification
      );
      const updated = nextNotifications.find((notification) => notification.id === id);

      if (!updated) {
        throw new Error('Notificacao nao encontrada.');
      }

      persistNotifications(nextNotifications);
      return updated;
    }
  };
}

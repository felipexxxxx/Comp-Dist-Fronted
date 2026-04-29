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
  UpdateTriageStatusInput,
  UpdatePatientInput,
  UserRole,
  UserRecord
} from './types';
import { readSession } from './session';

type BackendUserRecord = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
};

type BackendPatientRecord = {
  id: string;
  name: string;
  birthDate: string;
  sex: PatientRecord['sex'];
  phone: string;
  active: boolean;
  createdAt: string;
};

type BackendTriageRecord = TriageRecord;

type BackendNotificationRecord = NotificationRecord;

type BackendAuthSession = {
  token: string;
  tokenType: string;
  expiresAt: string;
  user: BackendUserRecord;
};

function mapUserRecord(user: BackendUserRecord): UserRecord {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
    createdAt: user.createdAt
  };
}

function mapPatientRecord(patient: BackendPatientRecord): PatientRecord {
  return {
    id: patient.id,
    name: patient.name,
    birthDate: patient.birthDate,
    sex: patient.sex,
    phone: patient.phone,
    active: patient.active,
    createdAt: patient.createdAt
  };
}

function mapTriageRecord(triage: BackendTriageRecord): TriageRecord {
  return triage;
}

function mapNotificationRecord(notification: BackendNotificationRecord): NotificationRecord {
  return notification;
}

async function requestJson<T>(baseUrl: string, path: string, init?: RequestInit): Promise<T> {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
  const session = readSession();
  const headers = new Headers(init?.headers ?? {});

  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (session?.token) {
    headers.set('Authorization', `${session.tokenType} ${session.token}`);
  }

  const response = await fetch(`${normalizedBaseUrl}${path}`, {
    headers,
    ...init
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(extractErrorMessage(text) || `Request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

async function requestWithoutBody(baseUrl: string, path: string, init?: RequestInit): Promise<void> {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
  const session = readSession();
  const headers = new Headers(init?.headers ?? {});

  if (session?.token) {
    headers.set('Authorization', `${session.tokenType} ${session.token}`);
  }

  const response = await fetch(`${normalizedBaseUrl}${path}`, {
    headers,
    ...init
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(extractErrorMessage(text) || `Request failed with ${response.status}`);
  }
}

function extractErrorMessage(text: string) {
  if (!text) {
    return '';
  }

  try {
    const parsed = JSON.parse(text) as { message?: string };
    return parsed.message || text;
  } catch {
    return text;
  }
}

export function createHttpHealthSysApi(baseUrl: string): HealthSysApi {
  const login = async (input: LoginInput): Promise<AuthSession> => {
    const session = await requestJson<BackendAuthSession>(baseUrl, '/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(input)
    });

    return {
      token: session.token,
      tokenType: session.tokenType,
      expiresAt: session.expiresAt,
      user: mapUserRecord(session.user)
    };
  };

  const listUsers = async () => {
    const users = await requestJson<BackendUserRecord[]>(baseUrl, '/api/users');
    return users.map(mapUserRecord);
  };

  const listPatients = async () => {
    const patients = await requestJson<BackendPatientRecord[]>(baseUrl, '/api/patients');
    return patients.map(mapPatientRecord);
  };

  const listTriages = async () => {
    const triages = await requestJson<BackendTriageRecord[]>(baseUrl, '/api/triages');
    return triages.map(mapTriageRecord);
  };

  const listNotifications = async (unread?: boolean) => {
    const query = unread ? '?unread=true' : '';
    const notifications = await requestJson<BackendNotificationRecord[]>(baseUrl, `/api/notifications${query}`);
    return notifications.map(mapNotificationRecord);
  };

  return {
    mode: 'http',
    baseUrl,

    login(input: LoginInput) {
      return login(input);
    },

    logout() {
      return requestWithoutBody(baseUrl, '/api/auth/logout', {
        method: 'POST'
      });
    },

    async getDashboardSummary() {
      const [usersResult, patientsResult, triagesResult, notificationsResult] = await Promise.allSettled([
        listUsers(),
        listPatients(),
        listTriages(),
        listNotifications(true)
      ]);

      const users = usersResult.status === 'fulfilled' ? usersResult.value : null;
      const patients = patientsResult.status === 'fulfilled' ? patientsResult.value : [];
      const triages = triagesResult.status === 'fulfilled' ? triagesResult.value : [];
      const notifications = notificationsResult.status === 'fulfilled' ? notificationsResult.value : [];
      const servicesOnline = [patientsResult, triagesResult, notificationsResult].filter((result) => result.status === 'fulfilled').length;

      return {
        usersCount: users?.length ?? null,
        activePatients: patients.filter((patient) => patient.active).length,
        inactivePatients: patients.filter((patient) => !patient.active).length,
        waitingTriages: triages.filter((triage) => triage.status === 'WAITING').length,
        inProgressTriages: triages.filter((triage) => triage.status === 'IN_PROGRESS').length,
        unreadNotifications: notifications.length,
        systemLoad: servicesOnline === 3 ? 'Online' : servicesOnline > 0 ? 'Parcial' : 'Indisponivel'
      } satisfies DashboardSummary;
    },

    listUsers() {
      return listUsers();
    },

    createUser(input: CreateUserInput) {
      return requestJson<BackendUserRecord>(baseUrl, '/api/users', {
        method: 'POST',
        body: JSON.stringify(input)
      }).then(mapUserRecord);
    },

    listPatients() {
      return listPatients();
    },

    createPatient(input: CreatePatientInput) {
      return requestJson<BackendPatientRecord>(baseUrl, '/api/patients', {
        method: 'POST',
        body: JSON.stringify(input)
      }).then(mapPatientRecord);
    },

    updatePatient(input: UpdatePatientInput) {
      return requestJson<BackendPatientRecord>(baseUrl, `/api/patients/${input.id}`, {
        method: 'PUT',
        body: JSON.stringify(input)
      }).then(mapPatientRecord);
    },

    listTriages() {
      return listTriages();
    },

    createTriage(input: CreateTriageInput) {
      return requestJson<BackendTriageRecord>(baseUrl, '/api/triages', {
        method: 'POST',
        body: JSON.stringify(input)
      }).then(mapTriageRecord);
    },

    updateTriageStatus(input: UpdateTriageStatusInput) {
      const { id, ...payload } = input;
      return requestJson<BackendTriageRecord>(baseUrl, `/api/triages/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      }).then(mapTriageRecord);
    },

    listNotifications(unread?: boolean) {
      return listNotifications(unread);
    },

    markNotificationAsRead(id: string) {
      return requestJson<BackendNotificationRecord>(baseUrl, `/api/notifications/${id}/read`, {
        method: 'PUT'
      }).then(mapNotificationRecord);
    }
  };
}

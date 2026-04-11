import type {
  AuthSession,
  CreatePatientInput,
  CreateUserInput,
  DashboardSummary,
  HealthSysApi,
  LoginInput,
  PatientRecord,
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
    throw new Error(text || `Request failed with ${response.status}`);
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
    throw new Error(text || `Request failed with ${response.status}`);
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
      const [users, patients] = await Promise.all([listUsers(), listPatients()]);

      return {
        usersCount: users.length,
        activePatients: patients.filter((patient) => patient.active).length,
        inactivePatients: patients.filter((patient) => !patient.active).length,
        systemLoad: 'Backend online'
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
    }
  };
}

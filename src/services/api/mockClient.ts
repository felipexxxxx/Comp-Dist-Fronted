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
import { createId, readJson, writeJson } from './storage';

const USERS_KEY = 'healthsys-users';
const PATIENTS_KEY = 'healthsys-patients';

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

function persistUsers(users: StoredUserRecord[]) {
  writeJson(USERS_KEY, users);
}

function persistPatients(patients: PatientRecord[]) {
  writeJson(PATIENTS_KEY, patients);
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
        throw new Error('Invalid credentials for the local demo account.');
      }

      return buildSession(stripPassword(matchedUser));
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
        systemLoad: 'Mock API online'
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
      return nextPatient;
    }
  };
}

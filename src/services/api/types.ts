export type UserRole = 'ADMIN' | 'RECEPTIONIST' | 'HEALTH_PROFESSIONAL';

export type PatientSex = 'FEMALE' | 'MALE' | 'OTHER';

export type DashboardSummary = {
  usersCount: number;
  activePatients: number;
  inactivePatients: number;
  systemLoad: string;
};

export type AuthSession = {
  token: string;
  tokenType: string;
  expiresAt: string;
  user: UserRecord;
};

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
};

export type PatientRecord = {
  id: string;
  name: string;
  birthDate: string;
  sex: PatientSex;
  phone: string;
  active: boolean;
  createdAt: string;
};

export type CreateUserInput = {
  name: string;
  email: string;
  role: UserRole;
  password: string;
};

export type CreatePatientInput = {
  name: string;
  birthDate: string;
  sex: PatientSex;
  phone: string;
};

export type UpdatePatientInput = CreatePatientInput & {
  id: string;
  active: boolean;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type HealthSysApi = {
  mode: 'mock' | 'http';
  baseUrl: string;
  login(input: LoginInput): Promise<AuthSession>;
  getDashboardSummary(): Promise<DashboardSummary>;
  listUsers(): Promise<UserRecord[]>;
  createUser(input: CreateUserInput): Promise<UserRecord>;
  listPatients(): Promise<PatientRecord[]>;
  createPatient(input: CreatePatientInput): Promise<PatientRecord>;
  updatePatient(input: UpdatePatientInput): Promise<PatientRecord>;
};

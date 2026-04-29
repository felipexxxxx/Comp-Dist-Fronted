export type UserRole = 'ADMIN' | 'RECEPTIONIST' | 'HEALTH_PROFESSIONAL';

export type PatientSex = 'FEMALE' | 'MALE' | 'OTHER';

export type TriagePriority = 'EMERGENCY' | 'VERY_URGENT' | 'URGENT' | 'LESS_URGENT' | 'NON_URGENT';

export type TriageStatus = 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type NotificationStatus = 'UNREAD' | 'READ';

export type DashboardSummary = {
  usersCount: number | null;
  activePatients: number;
  inactivePatients: number;
  waitingTriages: number;
  inProgressTriages: number;
  unreadNotifications: number;
  systemLoad: 'Online' | 'Parcial' | 'Indisponivel';
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

export type TriageRecord = {
  id: string;
  patientId: string;
  patientName: string;
  priority: TriagePriority;
  status: TriageStatus;
  chiefComplaint: string;
  notes?: string | null;
  attendedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  attendedAt?: string | null;
};

export type NotificationRecord = {
  id: string;
  eventType: string;
  resourceId?: string | null;
  routingKey: string;
  payload: string;
  status: NotificationStatus;
  occurredAt: string;
  readAt?: string | null;
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

export type CreateTriageInput = {
  patientId: string;
  patientName: string;
  priority: TriagePriority;
  chiefComplaint: string;
  notes?: string;
};

export type UpdateTriageStatusInput = {
  id: string;
  status: TriageStatus;
  notes?: string;
  attendedBy?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type HealthSysApi = {
  mode: 'mock' | 'http';
  baseUrl: string;
  login(input: LoginInput): Promise<AuthSession>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<UserRecord>;
  getDashboardSummary(): Promise<DashboardSummary>;
  listUsers(): Promise<UserRecord[]>;
  createUser(input: CreateUserInput): Promise<UserRecord>;
  listPatients(): Promise<PatientRecord[]>;
  getPatient(id: string): Promise<PatientRecord>;
  createPatient(input: CreatePatientInput): Promise<PatientRecord>;
  updatePatient(input: UpdatePatientInput): Promise<PatientRecord>;
  listTriages(): Promise<TriageRecord[]>;
  getTriage(id: string): Promise<TriageRecord>;
  listTriagesByPatient(patientId: string): Promise<TriageRecord[]>;
  createTriage(input: CreateTriageInput): Promise<TriageRecord>;
  updateTriageStatus(input: UpdateTriageStatusInput): Promise<TriageRecord>;
  listNotifications(unread?: boolean): Promise<NotificationRecord[]>;
  getNotification(id: string): Promise<NotificationRecord>;
  markNotificationAsRead(id: string): Promise<NotificationRecord>;
};

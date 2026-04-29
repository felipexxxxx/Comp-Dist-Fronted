import { createHttpHealthSysApi } from './httpClient';
import { createMockHealthSysApi } from './mockClient';
import type { HealthSysApi } from './types';

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || '';
const useMockApi = import.meta.env.VITE_USE_MOCK_API !== 'false' || configuredBaseUrl.length === 0;

export const apiClient: HealthSysApi = useMockApi ? createMockHealthSysApi() : createHttpHealthSysApi(configuredBaseUrl);

export const apiEnvironment = {
  mode: apiClient.mode,
  baseUrl: useMockApi ? 'local-storage' : configuredBaseUrl,
  isMock: useMockApi
};

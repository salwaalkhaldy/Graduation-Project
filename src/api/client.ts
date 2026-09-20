import { USE_MOCK_API } from '../config/env';
import { ApiClientContract } from './contracts';
import { HttpAdapter } from './http/httpAdapter';
import { seedIfEmpty } from './mock/db';
import { MockAdapter } from './mock/mockAdapter';

// Ensure demo database is seeded on first load
if (USE_MOCK_API) {
  seedIfEmpty();
}

const mockInstance = new MockAdapter();
const httpInstance = new HttpAdapter();

export const api: ApiClientContract = USE_MOCK_API ? mockInstance : httpInstance;

export function getActiveAdapter(): ApiClientContract {
  return USE_MOCK_API ? mockInstance : httpInstance;
}

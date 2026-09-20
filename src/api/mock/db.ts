import { ApiError, ApiErrorCode } from '../../types/domain';
import { createInitialDatabaseSeed, MockDatabaseState } from './seed';

const DB_KEY = 'sdp.db.v1';
const SESSION_KEY = 'sdp.session.v1';
const DRIVER_LOCATION_KEY = 'sdp.driver_location.v1';

let inMemoryDb: MockDatabaseState | null = null;
let inMemorySessionToken: string | null = null;
let inMemoryDriverLocation: string | null = null;

export class MockApiException extends Error {
  code: ApiErrorCode;
  details?: Record<string, string>;

  constructor(code: ApiErrorCode, message: string, details?: Record<string, string>) {
    super(message);
    this.name = 'MockApiException';
    this.code = code;
    this.details = details;
  }
}

export function loadDatabase(): MockDatabaseState {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.deliveryRequests)) {
        parsed.deliveryRequests = parsed.deliveryRequests.map((r: any) => ({
          ...r,
          id: r.id || r.requestId,
        }));
      }
      return parsed;
    }
  } catch (err) {
    console.warn('localStorage read failed, falling back to memory state', err);
    if (inMemoryDb) return inMemoryDb;
  }

  const initial = createInitialDatabaseSeed();
  saveDatabase(initial);
  return initial;
}

export function saveDatabase(state: MockDatabaseState): void {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('localStorage save failed, keeping in memory', err);
  }
  inMemoryDb = state;
}

export function resetDatabase(): MockDatabaseState {
  const fresh = createInitialDatabaseSeed();
  saveDatabase(fresh);
  return fresh;
}

export function seedIfEmpty(): void {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      resetDatabase();
    }
  } catch {
    if (!inMemoryDb) {
      resetDatabase();
    }
  }
}

// Session Token Management
export function getStoredSessionToken(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return inMemorySessionToken;
  }
}

export function setStoredSessionToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(SESSION_KEY, token);
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // fallback in memory
  }
  inMemorySessionToken = token;
}

// Demo Driver Location Persistence
export function getStoredDriverLocation(): string | null {
  try {
    return localStorage.getItem(DRIVER_LOCATION_KEY);
  } catch {
    return inMemoryDriverLocation;
  }
}

export function setStoredDriverLocation(areaName: string): void {
  try {
    localStorage.setItem(DRIVER_LOCATION_KEY, areaName);
  } catch {
    // fallback in memory
  }
  inMemoryDriverLocation = areaName;
}

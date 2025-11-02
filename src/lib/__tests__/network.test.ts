import { describe, it, expect } from 'vitest';
import { isRetryableError, getRetryDelay, shouldRetryMutation, RETRY_CONFIG } from '../network';

describe('isRetryableError', () => {
  it('❌ NON-REJOUABLE : erreur Zod', () => {
    expect(isRetryableError({ name: 'ZodError' })).toBe(false);
  });

  it('❌ NON-REJOUABLE : erreur RLS (code PostgreSQL)', () => {
    expect(isRetryableError({ code: '42501' })).toBe(false);
  });

  it('❌ NON-REJOUABLE : erreur RLS (message)', () => {
    expect(isRetryableError({ message: 'row-level security policy violation' })).toBe(false);
  });

  it('❌ NON-REJOUABLE : contrainte unique', () => {
    expect(isRetryableError({ code: '23505' })).toBe(false);
  });

  it('❌ NON-REJOUABLE : foreign key violation', () => {
    expect(isRetryableError({ code: '23503' })).toBe(false);
  });

  it('❌ NON-REJOUABLE : check constraint violation', () => {
    expect(isRetryableError({ code: '23514' })).toBe(false);
  });

  it('❌ NON-REJOUABLE : not null violation', () => {
    expect(isRetryableError({ code: '23502' })).toBe(false);
  });

  it('❌ NON-REJOUABLE : undefined table', () => {
    expect(isRetryableError({ code: '42P01' })).toBe(false);
  });

  it('❌ NON-REJOUABLE : 400 Bad Request', () => {
    expect(isRetryableError({ status: 400 })).toBe(false);
  });

  it('❌ NON-REJOUABLE : 401 Unauthorized', () => {
    expect(isRetryableError({ status: 401 })).toBe(false);
  });

  it('❌ NON-REJOUABLE : 403 Forbidden', () => {
    expect(isRetryableError({ status: 403 })).toBe(false);
  });

  it('❌ NON-REJOUABLE : 404 Not Found', () => {
    expect(isRetryableError({ status: 404 })).toBe(false);
  });

  it('❌ NON-REJOUABLE : message "permission denied"', () => {
    expect(isRetryableError({ message: 'Permission denied for table prompts' })).toBe(false);
  });

  it('❌ NON-REJOUABLE : message "unauthorized"', () => {
    expect(isRetryableError({ message: 'Unauthorized access' })).toBe(false);
  });

  it('❌ NON-REJOUABLE : message "invalid"', () => {
    expect(isRetryableError({ message: 'Invalid email format' })).toBe(false);
  });

  it('❌ NON-REJOUABLE : message "constraint"', () => {
    expect(isRetryableError({ message: 'Constraint violation detected' })).toBe(false);
  });

  it('❌ NON-REJOUABLE : message "violation"', () => {
    expect(isRetryableError({ message: 'Unique key violation' })).toBe(false);
  });

  it('❌ NON-REJOUABLE : message "not found"', () => {
    expect(isRetryableError({ message: 'Resource not found' })).toBe(false);
  });

  it('❌ NON-REJOUABLE : message "already exists"', () => {
    expect(isRetryableError({ message: 'Prompt already exists' })).toBe(false);
  });

  it('❌ NON-REJOUABLE : message "duplicate"', () => {
    expect(isRetryableError({ message: 'Duplicate key found' })).toBe(false);
  });

  it('✅ REJOUABLE : erreur réseau (fetch failed)', () => {
    expect(isRetryableError({ message: 'fetch failed' })).toBe(true);
  });

  it('✅ REJOUABLE : erreur réseau (network error)', () => {
    expect(isRetryableError({ message: 'network error occurred' })).toBe(true);
  });

  it('✅ REJOUABLE : timeout (message)', () => {
    expect(isRetryableError({ message: 'Request timeout' })).toBe(true);
  });

  it('✅ REJOUABLE : 408 Request Timeout', () => {
    expect(isRetryableError({ status: 408 })).toBe(true);
  });

  it('✅ REJOUABLE : 429 Too Many Requests (rate-limit)', () => {
    expect(isRetryableError({ status: 429 })).toBe(true);
  });

  it('✅ REJOUABLE : 500 Internal Server Error', () => {
    expect(isRetryableError({ status: 500 })).toBe(true);
  });

  it('✅ REJOUABLE : 502 Bad Gateway', () => {
    expect(isRetryableError({ status: 502 })).toBe(true);
  });

  it('✅ REJOUABLE : 503 Service Unavailable', () => {
    expect(isRetryableError({ status: 503 })).toBe(true);
  });

  it('✅ REJOUABLE : 504 Gateway Timeout', () => {
    expect(isRetryableError({ status: 504 })).toBe(true);
  });

  it('✅ REJOUABLE : ECONNREFUSED', () => {
    expect(isRetryableError({ message: 'ECONNREFUSED: Connection refused' })).toBe(true);
  });

  it('✅ REJOUABLE : ENOTFOUND', () => {
    expect(isRetryableError({ message: 'ENOTFOUND: DNS lookup failed' })).toBe(true);
  });

  it('❌ NON-REJOUABLE par défaut : erreur inconnue', () => {
    expect(isRetryableError({ message: 'Some unknown error' })).toBe(false);
  });

  it('❌ NON-REJOUABLE : erreur vide', () => {
    expect(isRetryableError({})).toBe(false);
  });

  it('❌ NON-REJOUABLE : erreur null', () => {
    expect(isRetryableError(null)).toBe(false);
  });
});

describe('getRetryDelay', () => {
  it('Tentative 1 : 1000ms (1s)', () => {
    expect(getRetryDelay(1)).toBe(1000);
  });

  it('Tentative 2 : 2000ms (2s)', () => {
    expect(getRetryDelay(2)).toBe(2000);
  });

  it('Tentative 3 : 4000ms (4s)', () => {
    expect(getRetryDelay(3)).toBe(4000);
  });

  it('Tentative 4 : 5000ms (plafonné à MAX_DELAY)', () => {
    expect(getRetryDelay(4)).toBe(RETRY_CONFIG.MAX_DELAY);
  });

  it('Tentative 5 : toujours plafonné à 5000ms', () => {
    expect(getRetryDelay(5)).toBe(RETRY_CONFIG.MAX_DELAY);
  });

  it('Tentative 10 : toujours plafonné à 5000ms', () => {
    expect(getRetryDelay(10)).toBe(RETRY_CONFIG.MAX_DELAY);
  });
});

describe('shouldRetryMutation', () => {
  it('✅ Retry autorisé : tentative 1, erreur réseau', () => {
    expect(shouldRetryMutation(1, { message: 'fetch failed' })).toBe(true);
  });

  it('✅ Retry autorisé : tentative 2, erreur réseau', () => {
    expect(shouldRetryMutation(2, { message: 'network error' })).toBe(true);
  });

  it('❌ Retry refusé : tentative 3 (limite atteinte), erreur réseau', () => {
    expect(shouldRetryMutation(3, { message: 'fetch failed' })).toBe(false);
  });

  it('❌ Retry refusé : tentative 4 (dépassé), erreur réseau', () => {
    expect(shouldRetryMutation(4, { message: 'network error' })).toBe(false);
  });

  it('❌ Retry refusé : tentative 1, erreur RLS', () => {
    expect(shouldRetryMutation(1, { code: '42501' })).toBe(false);
  });

  it('❌ Retry refusé : tentative 1, erreur Zod', () => {
    expect(shouldRetryMutation(1, { name: 'ZodError' })).toBe(false);
  });

  it('❌ Retry refusé : tentative 1, contrainte unique', () => {
    expect(shouldRetryMutation(1, { code: '23505' })).toBe(false);
  });

  it('❌ Retry refusé : tentative 1, 400 Bad Request', () => {
    expect(shouldRetryMutation(1, { status: 400 })).toBe(false);
  });

  it('✅ Retry autorisé : tentative 1, 500 Internal Server Error', () => {
    expect(shouldRetryMutation(1, { status: 500 })).toBe(true);
  });

  it('✅ Retry autorisé : tentative 2, 503 Service Unavailable', () => {
    expect(shouldRetryMutation(2, { status: 503 })).toBe(true);
  });

  it('✅ Retry autorisé : tentative 1, 408 Timeout', () => {
    expect(shouldRetryMutation(1, { status: 408 })).toBe(true);
  });

  it('✅ Retry autorisé : tentative 1, 429 Rate Limit', () => {
    expect(shouldRetryMutation(1, { status: 429 })).toBe(true);
  });

  it('❌ Retry refusé : tentative 1, erreur métier "not found"', () => {
    expect(shouldRetryMutation(1, { message: 'Prompt not found' })).toBe(false);
  });

  it('❌ Retry refusé : tentative 1, erreur métier "already exists"', () => {
    expect(shouldRetryMutation(1, { message: 'Prompt already exists' })).toBe(false);
  });

  it('❌ Retry refusé : tentative 1, erreur permission', () => {
    expect(shouldRetryMutation(1, { message: 'permission denied' })).toBe(false);
  });
});

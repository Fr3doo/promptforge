import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleSupabaseError, getSafeErrorMessage } from '../errorHandler';
import { messages } from '@/constants/messages';
import * as logger from '@/lib/logger';

// Mock logger to avoid console noise in tests
vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
}));

describe('handleSupabaseError', () => {
  it('should not throw when error is null', () => {
    const result = { data: { id: '123' }, error: null };
    
    expect(() => handleSupabaseError(result)).not.toThrow();
  });

  it('should throw when error is present', () => {
    const mockError = new Error('Database error');
    const result = { data: null, error: mockError };
    
    expect(() => handleSupabaseError(result)).toThrow('Database error');
  });

  it('should throw the exact error object provided', () => {
    const mockError = new Error('Duplicate key');
    const result = { data: null, error: mockError };
    
    expect(() => handleSupabaseError(result)).toThrow('Duplicate key');
  });

  it('should work with different data types', () => {
    const stringResult = { data: 'test', error: null };
    const arrayResult = { data: [1, 2, 3], error: null };
    const objectResult = { data: { key: 'value' }, error: null };
    
    expect(() => handleSupabaseError(stringResult)).not.toThrow();
    expect(() => handleSupabaseError(arrayResult)).not.toThrow();
    expect(() => handleSupabaseError(objectResult)).not.toThrow();
  });
});

describe('getSafeErrorMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Zod validation errors', () => {
    it('should return Zod error message when available', () => {
      const zodError = {
        name: 'ZodError',
        errors: [{ message: 'Le titre est requis' }],
      };
      
      expect(getSafeErrorMessage(zodError)).toBe('Le titre est requis');
    });

    it('should return fallback for Zod errors without message', () => {
      const zodError = {
        name: 'ZodError',
        errors: [],
      };
      
      expect(getSafeErrorMessage(zodError)).toBe('Données invalides');
    });
  });

  describe('PostgreSQL error codes', () => {
    it('should map code 23505 to duplicate error', () => {
      const error = { code: '23505', message: 'duplicate key value' };
      
      expect(getSafeErrorMessage(error)).toBe(messages.errors.database.duplicate);
    });

    it('should map code 23503 to invalid reference error', () => {
      const error = { code: '23503', message: 'foreign key violation' };
      
      expect(getSafeErrorMessage(error)).toBe(messages.errors.database.invalidReference);
    });

    it('should map code 23514 to constraint violation error', () => {
      const error = { code: '23514', message: 'check constraint violation' };
      
      expect(getSafeErrorMessage(error)).toBe(messages.errors.database.constraintViolation);
    });

    it('should map code 42501 to unauthorized error', () => {
      const error = { code: '42501', message: 'permission denied' };
      
      expect(getSafeErrorMessage(error)).toBe(messages.errors.database.unauthorized);
    });
  });

  describe('Error message patterns', () => {
    it('should detect row-level security violations', () => {
      const error = { message: 'new row violates row-level security policy' };
      
      expect(getSafeErrorMessage(error)).toBe(messages.errors.database.rlsViolation);
    });

    it('should detect JWT/token expiration (jwt)', () => {
      const error = { message: 'JWT expired' };
      
      expect(getSafeErrorMessage(error)).toBe(messages.errors.database.sessionExpired);
    });

    it('should detect JWT/token expiration (token)', () => {
      const error = { message: 'Invalid token provided' };
      
      expect(getSafeErrorMessage(error)).toBe(messages.errors.database.sessionExpired);
    });

    it('should detect unique constraint violations', () => {
      const error = { message: 'unique constraint failed' };
      
      expect(getSafeErrorMessage(error)).toBe(messages.errors.database.uniqueViolation);
    });

    it('should detect invalid email errors (invalid email)', () => {
      const error = { message: 'Invalid email format' };
      
      expect(getSafeErrorMessage(error)).toBe(messages.errors.database.invalidEmail);
    });

    it('should detect invalid email errors (invalid_grant)', () => {
      const error = { message: 'Error: invalid_grant' };
      
      expect(getSafeErrorMessage(error)).toBe(messages.errors.database.invalidEmail);
    });

    it('should detect user already registered errors', () => {
      const error = { message: 'User already registered' };
      
      expect(getSafeErrorMessage(error)).toBe(messages.errors.database.userExists);
    });

    it('should detect email not confirmed errors', () => {
      const error = { message: 'Email not confirmed' };
      
      expect(getSafeErrorMessage(error)).toBe(messages.errors.database.emailNotConfirmed);
    });

    it('should detect invalid password errors', () => {
      const error = { message: 'Invalid password' };
      
      expect(getSafeErrorMessage(error)).toBe(messages.errors.database.invalidPassword);
    });
  });

  describe('Pattern matching priority', () => {
    it('should prioritize code match over pattern match', () => {
      const error = { 
        code: '23505', 
        message: 'duplicate key violates unique constraint' 
      };
      
      // Should return code-based message, not pattern-based "unique"
      expect(getSafeErrorMessage(error)).toBe(messages.errors.database.duplicate);
    });

    it('should be case-insensitive for message patterns', () => {
      const error = { message: 'JWT EXPIRED' };
      
      expect(getSafeErrorMessage(error)).toBe(messages.errors.database.sessionExpired);
    });
  });

  describe('Edge cases', () => {
    it('should return generic error for unknown error codes', () => {
      const error = { code: '99999', message: 'Unknown error' };
      
      expect(getSafeErrorMessage(error)).toBe(messages.errors.generic);
    });

    it('should return generic error for unmatched messages', () => {
      const error = { message: 'Some random error' };
      
      expect(getSafeErrorMessage(error)).toBe(messages.errors.generic);
    });

    it('should handle errors without code or message', () => {
      const error = {};
      
      expect(getSafeErrorMessage(error)).toBe(messages.errors.generic);
    });

    it('should handle null/undefined errors', () => {
      expect(getSafeErrorMessage(null)).toBe(messages.errors.generic);
      expect(getSafeErrorMessage(undefined)).toBe(messages.errors.generic);
    });

    it('should handle string errors', () => {
      expect(getSafeErrorMessage('Simple string error')).toBe(messages.errors.generic);
    });
  });

  describe('Logging behavior', () => {
    it('should log error details for debugging', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n  at ...';
      (error as any).code = '23505';
      
      getSafeErrorMessage(error);
      
      expect(logger.logError).toHaveBeenCalledWith(
        'Error details',
        expect.objectContaining({
          error: 'Test error',
          code: '23505',
          stack: expect.any(String),
        })
      );
    });
  });
});

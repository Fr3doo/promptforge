import { describe, it, expect } from 'vitest';
import { handleSupabaseError } from '../errorHandler';

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

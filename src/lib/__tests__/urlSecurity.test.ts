import { describe, it, expect } from 'vitest';
import { safeRedirectPath, isValidRedirectPath } from '../urlSecurity';

describe('safeRedirectPath', () => {
  describe('valid internal paths', () => {
    it('accepts absolute internal paths', () => {
      expect(safeRedirectPath('/dashboard')).toBe('/dashboard');
      expect(safeRedirectPath('/prompts')).toBe('/prompts');
      expect(safeRedirectPath('/')).toBe('/');
    });

    it('accepts paths with query parameters', () => {
      expect(safeRedirectPath('/prompts?id=123')).toBe('/prompts?id=123');
      expect(safeRedirectPath('/auth?redirect=true')).toBe('/auth?redirect=true');
      expect(safeRedirectPath('/search?q=test&page=2')).toBe('/search?q=test&page=2');
    });

    it('accepts paths with hash fragments', () => {
      expect(safeRedirectPath('/#features')).toBe('/#features');
      expect(safeRedirectPath('/docs#section')).toBe('/docs#section');
      expect(safeRedirectPath('/faq#question-1')).toBe('/faq#question-1');
    });

    it('accepts paths with both query params and hash', () => {
      expect(safeRedirectPath('/page?foo=bar#section')).toBe('/page?foo=bar#section');
    });

    it('accepts nested paths', () => {
      expect(safeRedirectPath('/prompts/editor/123')).toBe('/prompts/editor/123');
      expect(safeRedirectPath('/settings/profile')).toBe('/settings/profile');
    });
  });

  describe('blocked external URLs', () => {
    it('blocks URLs with http/https scheme', () => {
      expect(safeRedirectPath('http://evil.com')).toBe('/');
      expect(safeRedirectPath('https://evil.com/path')).toBe('/');
      expect(safeRedirectPath('http://localhost:3000')).toBe('/');
    });

    it('blocks URLs with dangerous schemes', () => {
      expect(safeRedirectPath('javascript:alert(1)')).toBe('/');
      expect(safeRedirectPath('javascript:void(0)')).toBe('/');
      expect(safeRedirectPath('data:text/html,<script>')).toBe('/');
      expect(safeRedirectPath('vbscript:msgbox')).toBe('/');
      expect(safeRedirectPath('file:///etc/passwd')).toBe('/');
    });

    it('blocks scheme-relative URLs', () => {
      expect(safeRedirectPath('//evil.com')).toBe('/');
      expect(safeRedirectPath('//evil.com/path')).toBe('/');
      expect(safeRedirectPath('//localhost')).toBe('/');
    });
  });

  describe('blocked relative paths', () => {
    it('blocks paths without leading slash', () => {
      expect(safeRedirectPath('dashboard')).toBe('/');
      expect(safeRedirectPath('prompts/123')).toBe('/');
    });

    it('blocks path traversal attempts', () => {
      expect(safeRedirectPath('../admin')).toBe('/');
      expect(safeRedirectPath('../../etc/passwd')).toBe('/');
    });
  });

  describe('blocked bypass attempts', () => {
    it('blocks backslash confusion attacks', () => {
      expect(safeRedirectPath('/\\evil.com')).toBe('/');
      expect(safeRedirectPath('/\\\\evil.com')).toBe('/');
    });

    it('blocks newline injection (HTTP response splitting)', () => {
      expect(safeRedirectPath('/path\nLocation: evil.com')).toBe('/');
      expect(safeRedirectPath('/valid\nX-Injected: header')).toBe('/');
    });

    it('blocks carriage return injection', () => {
      expect(safeRedirectPath('/path\r\nSet-Cookie: x')).toBe('/');
      expect(safeRedirectPath('/path\rmalicious')).toBe('/');
    });

    it('blocks null byte injection', () => {
      expect(safeRedirectPath('/path\0evil')).toBe('/');
      expect(safeRedirectPath('/valid\0.js')).toBe('/');
    });
  });

  describe('null/undefined/empty handling', () => {
    it('returns fallback for null', () => {
      expect(safeRedirectPath(null)).toBe('/');
    });

    it('returns fallback for undefined', () => {
      expect(safeRedirectPath(undefined)).toBe('/');
    });

    it('returns fallback for empty string', () => {
      expect(safeRedirectPath('')).toBe('/');
    });

    it('returns fallback for whitespace-only string', () => {
      expect(safeRedirectPath('   ')).toBe('/');
      expect(safeRedirectPath('\t\n')).toBe('/');
    });
  });

  describe('custom fallback', () => {
    it('uses custom fallback for invalid paths', () => {
      expect(safeRedirectPath('//evil.com', '/home')).toBe('/home');
      expect(safeRedirectPath('javascript:alert', '/dashboard')).toBe('/dashboard');
    });

    it('uses custom fallback for null/undefined', () => {
      expect(safeRedirectPath(null, '/dashboard')).toBe('/dashboard');
      expect(safeRedirectPath(undefined, '/home')).toBe('/home');
    });
  });

  describe('whitespace trimming', () => {
    it('trims leading/trailing whitespace from valid paths', () => {
      expect(safeRedirectPath('  /dashboard  ')).toBe('/dashboard');
      expect(safeRedirectPath('\t/prompts\n')).toBe('/prompts');
    });

    it('still blocks invalid paths after trimming', () => {
      expect(safeRedirectPath('  //evil.com  ')).toBe('/');
      expect(safeRedirectPath('  javascript:alert  ')).toBe('/');
    });
  });
});

describe('isValidRedirectPath', () => {
  describe('valid paths', () => {
    it('returns true for valid internal paths', () => {
      expect(isValidRedirectPath('/dashboard')).toBe(true);
      expect(isValidRedirectPath('/')).toBe(true);
      expect(isValidRedirectPath('/prompts?id=123')).toBe(true);
      expect(isValidRedirectPath('/docs#section')).toBe(true);
    });
  });

  describe('invalid paths', () => {
    it('returns false for external URLs', () => {
      expect(isValidRedirectPath('//evil.com')).toBe(false);
      expect(isValidRedirectPath('https://evil.com')).toBe(false);
    });

    it('returns false for dangerous schemes', () => {
      expect(isValidRedirectPath('javascript:alert')).toBe(false);
      expect(isValidRedirectPath('data:text/html')).toBe(false);
    });

    it('returns false for null/undefined/empty', () => {
      expect(isValidRedirectPath(null)).toBe(false);
      expect(isValidRedirectPath(undefined)).toBe(false);
      expect(isValidRedirectPath('')).toBe(false);
    });

    it('returns false for relative paths', () => {
      expect(isValidRedirectPath('dashboard')).toBe(false);
      expect(isValidRedirectPath('../admin')).toBe(false);
    });
  });
});

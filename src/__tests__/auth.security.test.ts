import { describe, expect, it } from 'vitest';
import { isValidAdminPasscode, isValidDeveloperPasscode, requireSchoolScope } from '../../server/middleware/auth';

describe('admin auth passcode validation', () => {
  it('accepts the configured school passcode', () => {
    expect(isValidAdminPasscode('1987', '1987')).toBe(true);
  });

  it('rejects an incorrect passcode', () => {
    expect(isValidAdminPasscode('1987', '0000')).toBe(false);
  });

  it('does not allow a universal fallback code to bypass a configured school passcode', () => {
    expect(isValidAdminPasscode('1987', '1952')).toBe(false);
    expect(isValidAdminPasscode('1987', 'admin')).toBe(false);
  });

  it('allows the default school passcode only when the school is explicitly configured for it', () => {
    expect(isValidAdminPasscode('1952', '1952')).toBe(true);
    expect(isValidAdminPasscode(undefined, '1952')).toBe(false);
  });

  it('accepts only the configured developer passcode', () => {
    expect(isValidDeveloperPasscode('dev-secret-2026', 'dev-secret-2026')).toBe(true);
    expect(isValidDeveloperPasscode('1952', 'dev-secret-2026')).toBe(false);
    expect(isValidDeveloperPasscode('dev-secret-2026', undefined)).toBe(false);
  });

  it('rejects a branch admin request for another school', () => {
    const request = {
      user: { role: 'admin' },
      userSchoolId: 'ssm-gorakhpur',
      body: { schoolId: 'ssm-lucknow' },
      query: {}
    };
    const response = { status: (status: number) => ({ json: (body: { code: string }) => ({ code: body.code, status }) }) };
    const next = () => undefined;

    expect(requireSchoolScope(request, response, next)).toEqual({
      code: 'SCHOOL_SCOPE_FORBIDDEN',
      status: 403
    });
  });

  it('allows a developer admin request across schools', () => {
    const request = {
      user: { role: 'developer' },
      userSchoolId: '*',
      body: { schoolId: 'ssm-lucknow' },
      query: {}
    };
    const response = { status: () => ({ json: () => undefined }) };
    let continued = false;

    requireSchoolScope(request, response, () => {
      continued = true;
    });

    expect(continued).toBe(true);
  });
});

import {
  validatePasswordChange,
  validatePasswordResetEmail,
  validateRegistration,
} from '../src/utils/validation';

describe('Account registration validation', () => {
  it('requires a name', () => {
    expect(validateRegistration('', 'user@example.com', 'secret1', 'secret1')).toEqual({
      isValid: false,
      error: 'Name is required',
    });
  });

  it('rejects mismatched passwords', () => {
    expect(validateRegistration('User', 'user@example.com', 'secret1', 'secret2')).toEqual({
      isValid: false,
      error: 'Passwords do not match',
    });
  });

  it('accepts valid registration details', () => {
    expect(validateRegistration('User', 'user@example.com', 'secret1', 'secret1').isValid).toBe(true);
  });
});

describe('Password reset validation', () => {
  it('rejects empty and malformed emails', () => {
    expect(validatePasswordResetEmail('').isValid).toBe(false);
    expect(validatePasswordResetEmail('not-an-email').isValid).toBe(false);
  });

  it('accepts a valid email', () => {
    expect(validatePasswordResetEmail('user@example.com').isValid).toBe(true);
  });
});

describe('Change password validation', () => {
  it('requires the current password', () => {
    expect(validatePasswordChange('', 'newpass', 'newpass').error).toBe('Current password is required');
  });

  it('rejects mismatched new passwords', () => {
    expect(validatePasswordChange('oldpass', 'newpass', 'different').error).toBe('New passwords do not match');
  });

  it('rejects reusing the current password', () => {
    expect(validatePasswordChange('samepass', 'samepass', 'samepass').error).toBe('New password must be different from current password');
  });

  it('accepts valid password changes', () => {
    expect(validatePasswordChange('oldpass', 'newpass', 'newpass').isValid).toBe(true);
  });
});
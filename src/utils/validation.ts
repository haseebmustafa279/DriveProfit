/**
 * Input validation utilities
 */

/**
 * Validate description (non-empty string)
 */
export const isValidDescription = (description: string): boolean => {
  return typeof description === 'string' && description.trim().length > 0;
};

/**
 * Validate amount (positive number)
 */
export const isValidAmountInput = (amount: number): boolean => {
  return typeof amount === 'number' && amount > 0 && isFinite(amount);
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password (minimum 6 characters)
 */
export const isValidPassword = (password: string): boolean => {
  return typeof password === 'string' && password.length >= 6;
};

/**
 * Validate PIN (must be 4-6 digits)
 */
export const isValidPIN = (pin: string): boolean => {
  const pinRegex = /^\d{4,6}$/;
  return pinRegex.test(pin);
};

/**
 * Validation result object
 */
export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * Validate login credentials
 */
export const validateLoginCredentials = (email: string, password: string): ValidationResult => {
  if (!email || !password) {
    return { isValid: false, error: 'Email and password are required' };
  }

  if (!isValidEmail(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  if (!isValidPassword(password)) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }

  return { isValid: true, error: null };
};

/**
 * Validate account registration fields
 */
export const validateRegistration = (
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): ValidationResult => {
  if (!name.trim()) {
    return { isValid: false, error: 'Name is required' };
  }

  if (!email || !isValidEmail(email.trim())) {
    return { isValid: false, error: 'Invalid email format' };
  }

  if (!isValidPassword(password)) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  return { isValid: true, error: null };
};

/**
 * Validate a password-reset email
 */
export const validatePasswordResetEmail = (email: string): ValidationResult => {
  if (!email || !isValidEmail(email.trim())) {
    return { isValid: false, error: 'Enter a valid email address' };
  }

  return { isValid: true, error: null };
};

/**
 * Validate password change fields
 */
export const validatePasswordChange = (
  oldPassword: string,
  newPassword: string,
  confirmPassword: string
): ValidationResult => {
  if (!oldPassword) {
    return { isValid: false, error: 'Current password is required' };
  }

  if (!isValidPassword(newPassword)) {
    return { isValid: false, error: 'New password must be at least 6 characters' };
  }

  if (newPassword !== confirmPassword) {
    return { isValid: false, error: 'New passwords do not match' };
  }

  if (oldPassword === newPassword) {
    return { isValid: false, error: 'New password must be different from current password' };
  }

  return { isValid: true, error: null };
};

/**
 * Validate daily entry
 */
export const validateDailyEntry = (description: string, amount: number): ValidationResult => {
  if (!isValidDescription(description)) {
    return { isValid: false, error: 'Description cannot be empty' };
  }

  if (!Number.isInteger(amount) || !isValidAmountInput(amount)) {
    return { isValid: false, error: 'Amount must be greater than zero' };
  }

  return { isValid: true, error: null };
};

/**
 * Validate monthly entry
 */
export const validateMonthlyEntry = (description: string, amount: number): ValidationResult => {
  if (!isValidDescription(description)) {
    return { isValid: false, error: 'Description cannot be empty' };
  }

  if (!Number.isInteger(amount) || !isValidAmountInput(amount)) {
    return { isValid: false, error: 'Amount must be a positive whole rupee value' };
  }

  return { isValid: true, error: null };
};

import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export function generateStrongPassword(length = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

export function checkPasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  const feedback = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score < 3) feedback.push('Password is weak');
  else if (score < 5) feedback.push('Password is moderate');
  else feedback.push('Password is strong');

  if (password.length < 8) feedback.push('Password should be at least 8 characters long');
  if (!/[A-Z]/.test(password)) feedback.push('Add uppercase letters');
  if (!/[a-z]/.test(password)) feedback.push('Add lowercase letters');
  if (!/[0-9]/.test(password)) feedback.push('Add numbers');
  if (!/[^A-Za-z0-9]/.test(password)) feedback.push('Add special characters');

  return { score, feedback };
}
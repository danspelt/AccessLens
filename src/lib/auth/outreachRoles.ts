import type { UserRole } from '@/models/User';

/** Student ambassadors (moderator kept for legacy accounts). */
export function canAccessStudentOutreach(role: UserRole | undefined): boolean {
  return role === 'admin' || role === 'moderator' || role === 'student';
}

export function canAccessAdminOutreach(role: UserRole | undefined): boolean {
  return role === 'admin';
}

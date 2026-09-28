/**
 * Authentication related types
 */

export type UserRole = 'father' | 'son' | 'pending';

export interface FirebaseUser {
  uid: string;
  email: string;
  displayName: string | null;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
  privateWorkspaceId?: string;
}

export interface AuthState {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

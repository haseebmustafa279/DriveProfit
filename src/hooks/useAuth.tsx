/**
 * useAuth hook
 * Provides authentication state and methods throughout the app
 * Uses React Context for state management
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../firebase/auth';
import { FirebaseUser, AuthState, LoginCredentials, UserRole } from '../types/auth';

// Create context
const AuthContext = createContext<
  | {
    state: AuthState;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    getUserRole: () => UserRole | null;
  }
  | undefined
>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    userProfile: null,
    isLoading: true,
    error: null,
    isInitialized: false,
  });

  // Initialize auth state on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Try to recover session from AsyncStorage
        const session = await authService.recoverSession();

        if (session) {
          // Firebase auth and the Firestore profile listener are authoritative.
          // Keep the cached session out of the app stack until both are loaded.
          setState(prev => ({
            ...prev,
            user: session.user,
            userProfile: null,
          }));
        } else {
          // The auth listener will confirm whether Firebase has a session.
        }
      } catch (error) {
        console.error('Failed to recover session:', error);
        setState(prev => ({
          ...prev,
          isInitialized: true,
          isLoading: false,
        }));
      }
    };

    // Set up auth state listener
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          // Load user profile from Firestore
          const userProfile = await authService.getUserProfile(firebaseUser.uid);
          await authService.storeUserProfile(userProfile);

          setState(prev => ({
            ...prev,
            user: firebaseUser,
            userProfile,
            isInitialized: true,
            isLoading: false,
            error: null,
          }));
        } else {
          setState(prev => ({
            ...prev,
            user: null,
            userProfile: null,
            isInitialized: true,
            isLoading: false,
            error: null,
          }));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Authentication error';
        setState(prev => ({
          ...prev,
          user: null,
          userProfile: null,
          isInitialized: true,
          isLoading: false,
          error: errorMessage,
        }));
      }
    });

    initializeAuth();

    // Clean up listener
    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const user = await authService.login(credentials);

      // Load user profile
      const userProfile = await authService.getUserProfile(user.uid);
      await authService.storeUserProfile(userProfile);

      setState(prev => ({
        ...prev,
        user,
        userProfile,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error('Login failed in useAuth:', error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Login failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await authService.logout();

      setState(prev => ({
        ...prev,
        user: null,
        userProfile: null,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { user, profile } = await authService.register(name, email, password);
      setState(prev => ({
        ...prev,
        user,
        userProfile: profile,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Account creation failed';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      throw error;
    }
  };

  const getUserRole = (): UserRole | null => {
    return state.userProfile?.role || null;
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        register,
        logout,
        getUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

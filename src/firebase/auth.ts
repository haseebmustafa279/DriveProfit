/**
 * Firebase Authentication service
 * Handles login, logout, session management, and user profile loading
 */

import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  User,
} from '@react-native-firebase/auth';

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from '@react-native-firebase/firestore';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  FirebaseUser,
  UserProfile,
  LoginCredentials,
} from '../types/auth';

import {
  FIRESTORE_COLLECTIONS,
  ERROR_MESSAGES,
  WORKSPACE_CONFIG,
} from '../constants/config';

class AuthService {
  private unsubscribe: (() => void) | null = null;

  /**
   * Set up authentication state listener
   */
  public onAuthStateChanged(
    callback: (user: FirebaseUser | null) => void
  ): () => void {
    this.unsubscribe = onAuthStateChanged(
      getAuth(),
      (firebaseUser: User | null) => {
        if (firebaseUser) {
          const user: FirebaseUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName,
          };

          callback(user);
        } else {
          callback(null);
        }
      }
    );

    return () => {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
    };
  }

  /**
   * Login with email and password
   */
  public async login(
    credentials: LoginCredentials
  ): Promise<FirebaseUser> {
    try {
      console.log('Attempting Firebase login:', credentials.email);

      const userCredential = await signInWithEmailAndPassword(
        getAuth(),
        credentials.email.trim(),
        credentials.password
      );

      const firebaseUser = userCredential.user;

      console.log('Firebase login successful:', firebaseUser.uid);

      const user: FirebaseUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName,
      };

      // Store session
      await this.storeSession(user);

      return user;
    } catch (error) {
      console.error('Firebase login error:', error);

      throw this.handleAuthError(error);
    }
  }

  /**
   * Create an email/password account and its Firestore profile
   */
  public async register(
    name: string,
    email: string,
    password: string
  ): Promise<{ user: FirebaseUser; profile: UserProfile }> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        getAuth(),
        email.trim(),
        password
      );
      const firebaseUser = userCredential.user;
      const user: FirebaseUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || email.trim(),
        displayName: firebaseUser.displayName,
      };
      const profile = await this.createUserProfile(firebaseUser.uid, {
        name: name.trim(),
        email: user.email,
        role: 'pending',
        privateWorkspaceId: `${WORKSPACE_CONFIG.privatePrefix}${firebaseUser.uid}`,
      });

      await this.storeSession(user);
      await this.storeUserProfile(profile);
      return { user, profile };
    } catch (error) {
      console.error('Firebase registration error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Send a Firebase-managed password reset email
   */
  public async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(getAuth(), email.trim());
    } catch (error) {
      console.error('Firebase password reset error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Reauthenticate the current user before changing their password
   */
  public async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      const firebaseUser = getAuth().currentUser;
      if (!firebaseUser || !firebaseUser.email) {
        throw new Error(ERROR_MESSAGES.general.unauthorized);
      }

      const credential = EmailAuthProvider.credential(firebaseUser.email, oldPassword);
      await reauthenticateWithCredential(firebaseUser, credential);
      await updatePassword(firebaseUser, newPassword);
    } catch (error) {
      console.error('Firebase password change error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Logout current user
   */
  public async logout(): Promise<void> {
    try {
      await signOut(getAuth());
      await this.clearSession();
    } catch (error) {
      console.error('Firebase logout error:', error);
      throw new Error(ERROR_MESSAGES.auth.unknownError);
    }
  }

  /**
   * Get user profile from Firestore
   */
  public async getUserProfile(uid: string): Promise<UserProfile> {
    try {
      console.log('Loading Firestore user profile:', uid);

      const userDoc = await getDoc(
        doc(
          getFirestore(),
          FIRESTORE_COLLECTIONS.users,
          uid
        )
      );

      if (!userDoc.exists) {
        console.error('User profile does not exist:', uid);
        throw new Error('User profile not found');
      }

      const data = userDoc.data();

      if (!data) {
        throw new Error('User profile data is empty');
      }

      console.log('User profile loaded successfully');

      return data as UserProfile;
    } catch (error) {
      console.error('Firestore getUserProfile error:', error);

      // IMPORTANT:
      // Do not hide the real Firestore error while debugging.
      if (error instanceof Error) {
        throw error;
      }

      throw new Error('Failed to load user profile from Firestore');
    }
  }

  /**
   * Create user profile in Firestore
   */
  public async createUserProfile(
    uid: string,
    userData: Omit<
      UserProfile,
      'uid' | 'createdAt' | 'updatedAt'
    >
  ): Promise<UserProfile> {
    try {
      const now = Date.now();

      const profile: UserProfile = {
        ...userData,
        uid,
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(
        doc(
          getFirestore(),
          FIRESTORE_COLLECTIONS.users,
          uid
        ),
        profile
      );

      return profile;
    } catch (error) {
      console.error('Firestore createUserProfile error:', error);

      if (error instanceof Error) {
        throw error;
      }

      throw new Error('Failed to create user profile');
    }
  }

  /**
   * Update user profile
   */
  public async updateUserProfile(
    uid: string,
    updates: Partial<UserProfile>
  ): Promise<void> {
    try {
      await updateDoc(
        doc(
          getFirestore(),
          FIRESTORE_COLLECTIONS.users,
          uid
        ),
        {
          ...updates,
          updatedAt: Date.now(),
        }
      );
    } catch (error) {
      console.error('Firestore updateUserProfile error:', error);

      if (error instanceof Error) {
        throw error;
      }

      throw new Error('Failed to update user profile');
    }
  }

  /**
   * Get current authenticated user
   */
  public getCurrentUser(): FirebaseUser | null {
    const firebaseUser = getAuth().currentUser;

    if (!firebaseUser) {
      return null;
    }

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName,
    };
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return getAuth().currentUser !== null;
  }

  /**
   * Store session in AsyncStorage
   */
  private async storeSession(
    user: FirebaseUser
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'authUser',
        JSON.stringify(user)
      );
    } catch (error) {
      console.warn(
        'Failed to store session:',
        error
      );
    }
  }

  /**
   * Clear session from AsyncStorage
   */
  private async clearSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem('authUser');
      await AsyncStorage.removeItem('userProfile');
    } catch (error) {
      console.warn(
        'Failed to clear session:',
        error
      );
    }
  }

  /**
   * Recover session from AsyncStorage
   */
  public async recoverSession(): Promise<{
    user: FirebaseUser;
    profile: UserProfile;
  } | null> {
    try {
      const userJson =
        await AsyncStorage.getItem('authUser');

      const profileJson =
        await AsyncStorage.getItem('userProfile');

      if (userJson && profileJson) {
        const user =
          JSON.parse(userJson) as FirebaseUser;

        const profile =
          JSON.parse(profileJson) as UserProfile;

        return {
          user,
          profile,
        };
      }

      return null;
    } catch (error) {
      console.warn(
        'Failed to recover session:',
        error
      );

      return null;
    }
  }

  /**
   * Store user profile in AsyncStorage
   */
  public async storeUserProfile(
    profile: UserProfile
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(
        'userProfile',
        JSON.stringify(profile)
      );
    } catch (error) {
      console.warn(
        'Failed to store profile:',
        error
      );
    }
  }

  /**
   * Handle Firebase authentication errors
   */
  private handleAuthError(error: unknown): Error {
    console.error('handleAuthError received:', error);

    // React Native Firebase errors contain a `code`
    const firebaseError = error as {
      code?: string;
      message?: string;
    };

    const code = firebaseError?.code || '';
    const message = firebaseError?.message || '';

    console.log('Firebase error code:', code);
    console.log('Firebase error message:', message);

    switch (code) {
      case 'auth/user-not-found':
        return new Error(
          ERROR_MESSAGES.auth.userNotFound
        );

      case 'auth/wrong-password':
        return new Error(
          ERROR_MESSAGES.auth.wrongPassword
        );

      case 'auth/requires-recent-login':
        return new Error('Please sign in again before changing your password.');

      case 'auth/invalid-credential':
        return new Error(
          'Invalid email or password.'
        );

      case 'auth/invalid-email':
        return new Error(
          ERROR_MESSAGES.auth.invalidEmail
        );

      case 'auth/weak-password':
        return new Error(
          'Password must be at least 6 characters'
        );

      case 'auth/user-disabled':
        return new Error(
          'User account is disabled.'
        );

      case 'auth/too-many-requests':
        return new Error(
          'Too many failed login attempts. Try again later.'
        );

      case 'auth/network-request-failed':
        return new Error(
          ERROR_MESSAGES.auth.networkError
        );

      case 'auth/email-already-in-use':
        return new Error(
          ERROR_MESSAGES.auth.emailAlreadyInUse
        );

      default:
        console.error(
          'Unknown Firebase Auth error:',
          code,
          message
        );

        // During development, show the actual Firebase error.
        return new Error(
          message || 'Firebase authentication failed.'
        );
    }
  }
}

export const authService = new AuthService();